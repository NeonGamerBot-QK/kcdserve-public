# frozen_string_literal: true

Rails.application.routes.draw do
  # Devise authentication routes
  if !Rails.env.development? && ENV["GOOGLE_CLIENT_ID"].present?
    devise_for :users, controllers: {
      omniauth_callbacks: "users/omniauth_callbacks"
    }
  else
    devise_for :users, controllers: {
      registrations: "users/registrations"
    }
  end

  # Public-facing routes
  root "pages#home"
  get "auth/magic_login", to: "magic_links#show"
  post "auth/magic_login", to: "magic_links#create"
  post "dev_login", to: "dev_login#create" if Rails.env.development?
  post "dev_promote", to: "dev_login#promote" if Rails.env.development?
  get "dashboard", to: "pages#dashboard"

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

  # Service resume PDF download
  get "resume/:id", to: "resumes#show", as: :resume

  # Admin namespace
  namespace :admin do
    root "dashboard#index"
    resources :users, only: [ :index, :show, :new, :create, :edit, :update, :destroy ] do
      member do
        patch :restore
      end
      collection do
        get :archived
      end
    end
    resources :categories, except: [ :show ]
    resources :service_hours, only: [ :index, :show ] do
      member do
        patch :review
      end
    end
    resources :reports, only: [ :index ] do
      collection do
        get :export_csv
      end
    end
  end

  # Flipper UI (only in development)
  if Rails.env.development?
    mount Flipper::UI.app(Flipper) => "/flipper"
    mount LetterOpenerWeb::Engine, at: "/mail"
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
