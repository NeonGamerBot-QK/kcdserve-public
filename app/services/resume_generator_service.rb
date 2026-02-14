# frozen_string_literal: true

# Service object that generates a PDF service resume for a volunteer.
# Uses Prawn to build a professional document with hours breakdown and verification.
class ResumeGeneratorService
  # @param user [User] the volunteer to generate a resume for
  def initialize(user)
    @user = user
  end

  # Generates the PDF resume document
  #
  # @return [String] the rendered PDF content as a string
  def generate
    Prawn::Document.new(page_size: "LETTER", margin: 50) do |pdf|
      render_header(pdf)
      render_volunteer_info(pdf)
      render_hours_summary(pdf)
      render_category_breakdown(pdf)
      render_group_involvement(pdf)
      render_service_history(pdf)
      render_verification_block(pdf)
      render_footer(pdf)
    end.render
  end

  private

  def render_header(pdf)
    pdf.text "Community Service Resume", size: 24, style: :bold, align: :center
    pdf.text "KCDServe — Verified Service Record", size: 12, align: :center, color: "666666"
    pdf.move_down 10
    pdf.stroke_horizontal_rule
    pdf.move_down 20
  end

  def render_volunteer_info(pdf)
    pdf.text "Volunteer Information", size: 16, style: :bold
    pdf.move_down 8
    pdf.text "Name: #{@user.full_name}", size: 12
    pdf.text "Email: #{@user.email}", size: 12
    pdf.text "Phone: #{@user.phone || 'N/A'}", size: 12
    pdf.move_down 5
    pdf.text "Bio: #{@user.bio || 'N/A'}", size: 10, color: "444444" if @user.bio.present?
    pdf.move_down 15
  end

  def render_hours_summary(pdf)
    total = @user.total_approved_hours
    pdf.text "Total Approved Service Hours: #{total}", size: 16, style: :bold
    pdf.move_down 15
  end

  def render_category_breakdown(pdf)
    hours_by_category = @user.service_hours.approved.joins(:category).group("categories.name").sum(:hours)
    return if hours_by_category.empty?

    pdf.text "Hours by Category", size: 14, style: :bold
    pdf.move_down 8

    table_data = [["Category", "Hours"]]
    hours_by_category.each { |name, hours| table_data << [name, hours.to_f.round(2).to_s] }

    pdf.table(table_data, header: true, width: pdf.bounds.width) do
      row(0).font_style = :bold
      row(0).background_color = "DDDDDD"
      cells.padding = [6, 10]
    end
    pdf.move_down 15
  end

  def render_group_involvement(pdf)
    return if @user.groups.empty?

    pdf.text "Group Involvement", size: 14, style: :bold
    pdf.move_down 8
    @user.groups.each do |group|
      group_hours = @user.service_hours.approved.where(group: group).sum(:hours)
      pdf.text "• #{group.name} — #{group_hours.to_f.round(2)} hours", size: 11
    end
    pdf.move_down 15
  end

  def render_service_history(pdf)
    recent_hours = @user.service_hours.approved.includes(:category).order(service_date: :desc).limit(20)
    return if recent_hours.empty?

    pdf.text "Recent Service History", size: 14, style: :bold
    pdf.move_down 8

    table_data = [["Date", "Category", "Hours", "Description"]]
    recent_hours.each do |sh|
      table_data << [
        sh.service_date.strftime("%Y-%m-%d"),
        sh.category.name,
        sh.hours.to_f.round(2).to_s,
        sh.description.truncate(50)
      ]
    end

    pdf.table(table_data, header: true, width: pdf.bounds.width, cell_style: { size: 9 }) do
      row(0).font_style = :bold
      row(0).background_color = "DDDDDD"
      cells.padding = [4, 6]
    end
    pdf.move_down 15
  end

  def render_verification_block(pdf)
    pdf.stroke_horizontal_rule
    pdf.move_down 20
    pdf.text "Verification", size: 14, style: :bold
    pdf.move_down 10
    pdf.text "This service record has been verified by KCDServe administrators.", size: 10
    pdf.move_down 20
    pdf.text "Signature: ___________________________", size: 10
    pdf.move_down 10
    pdf.text "Date: ___________________________", size: 10
    pdf.move_down 10
    pdf.text "Admin Name: ___________________________", size: 10
  end

  def render_footer(pdf)
    pdf.move_down 30
    pdf.text "Generated on #{Date.current.strftime('%B %d, %Y')}", size: 8, align: :center, color: "999999"
    pdf.text "KCDServe Community Service Platform", size: 8, align: :center, color: "999999"
  end
end
