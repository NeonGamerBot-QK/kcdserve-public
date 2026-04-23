# frozen_string_literal: true

Rails.application.routes.draw do
  # Devise authentication routes
  devise_for :users, controllers: {
    omniauth_callbacks: "users/omniauth_callbacks",
    registrations: "users/registrations"
  }

  # Public-facing routes
  root "pages#home"
  get "auth/magic_login", to: "magic_links#show"
  post "auth/magic_login", to: "magic_links#create"
  post "dev_login", to: "dev_login#create" if Rails.env.development?
  post "dev_promote", to: "dev_login#promote" if Rails.env.development?
  get "dashboard", to: "pages#dashboard"
  get "feedback", to: "pages#feedback"

  # Volunteer opportunities (public index/show, authenticated actions)
  resources :opportunities, only: [ :index, :show, :new, :create, :edit, :update, :destroy ] do
    member do
      post :signup
      delete :withdraw
    end
  end

  # Service hour submissions
  resources :service_hours do
    member do
      patch :review
    end
  end

  # Tokenized supervisor approval/rejection links — no login required
  scope "supervisor_review", as: :supervisor_review do
    get  ":token/approve", to: "supervisor_reviews#approve",     as: :approve
    get  ":token/reject",  to: "supervisor_reviews#reject_form", as: :reject
    post ":token/reject",  to: "supervisor_reviews#reject"
  end

  # Groups
  resources :groups do
    member do
      post :join
      delete :leave
      post :add_member
      delete :remove_member
    end
  end

  # Volunteer profiles
  resources :profiles, only: [ :show, :edit, :update ]

  # Service resume PDF download and CSV hours export
  get "resume/:id", to: "resumes#show", as: :resume
  get "resume/:id/csv", to: "resumes#export_csv", as: :resume_csv

  # Admin namespace
  namespace :admin do
    root "dashboard#index"
    resources :users, only: [ :index, :show, :new, :create, :edit, :update, :destroy ] do
      member do
        patch :restore
        post :add_to_group
        delete :remove_from_group
        patch :inline_update
      end
      collection do
        get :archived
        get :spreadsheet
      end
    end
    resources :categories, except: [ :show ]
    resources :service_hours, only: [ :index, :show, :edit, :update ] do
      member do
        patch :review
      end
    end
    resources :reports, only: [ :index ] do
      collection do
        get :export_csv
      end
    end
    resources :groups do
      member do
        post :add_member
        delete :remove_member
      end
    end
    resources :volunteers, only: [ :index ]
    resources :audit_log, only: [ :index, :show ]
  end

  # Flipper UI — development: open; production: admin+ only
  if Rails.env.development?
    mount Flipper::UI.app(Flipper) => "/flipper"
    mount LetterOpenerWeb::Engine, at: "/mail"
  else
    authenticate :user, ->(u) { u.admin_or_above? } do
      mount Flipper::UI.app(Flipper) => "/flipper"
    end
  end

  # Mobile API
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      post "login", to: "sessions#create"
      post "login/verify", to: "sessions#verify"
      post "login/google", to: "sessions#google"
      get "login/google/redirect", to: "sessions#google_redirect", as: :google_redirect
      get "login/google/callback", to: "sessions#google_callback", as: :google_callback
      delete "logout", to: "sessions#destroy"
      get "me", to: "me#show"
      patch "me", to: "me#update"
      get "dashboard", to: "dashboard#show"
      resources :service_hours, only: [ :index, :create ]
      resources :categories, only: [ :index ]
      resources :opportunities, only: [ :index, :show ] do
        member do
          post :signup
          delete :withdraw
        end
      end
      resources :notifications, only: [ :index ] do
        member do
          patch :read
        end
      end
    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
