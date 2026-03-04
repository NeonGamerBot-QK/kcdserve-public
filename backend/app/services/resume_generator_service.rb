# frozen_string_literal: true

# Service object that generates a comprehensive PDF service resume for a volunteer.
# Includes a full lifetime service history with title, opportunity, and group details.
# Uses Prawn to build a professional, multi-page document with page numbers.
class ResumeGeneratorService
  HEADER_BG = "2C3E50"
  HEADER_TEXT = "FFFFFF"
  ROW_ALT_BG = "F5F7FA"
  SECTION_COLOR = "2C3E50"

  # @param user [User] the volunteer to generate a resume for
  def initialize(user)
    @user = user
    @approved_hours = user.service_hours.approved
  end

  # Generates the PDF resume document.
  #
  # @return [String] the rendered PDF content as a string
  def generate
    Prawn::Document.new(page_size: "LETTER", margin: 50) do |pdf|
      render_header(pdf)
      render_volunteer_info(pdf)
      render_lifetime_summary(pdf)
      render_category_breakdown(pdf)
      render_group_involvement(pdf)
      render_full_service_history(pdf)
      render_verification_block(pdf)
      render_page_numbers(pdf)
    end.render
  end

  private

  # Renders the document title and subtitle
  def render_header(pdf)
    pdf.text "Community Service Resume", size: 24, style: :bold, align: :center, color: SECTION_COLOR
    pdf.text "KCDServe — Verified Lifetime Service Record", size: 12, align: :center, color: "666666"
    pdf.move_down 10
    pdf.stroke_horizontal_rule
    pdf.move_down 20
  end

  # Renders volunteer name, email, phone, and bio
  def render_volunteer_info(pdf)
    pdf.text "Volunteer Information", size: 16, style: :bold, color: SECTION_COLOR
    pdf.move_down 8
    pdf.text "Name: #{@user.full_name}", size: 12
    pdf.text "Email: #{@user.email}", size: 12
    pdf.text "Phone: #{@user.phone || 'N/A'}", size: 12
    pdf.move_down 5
    pdf.text "Bio: #{@user.bio}", size: 10, color: "444444" if @user.bio.present?
    pdf.move_down 15
  end

  # Renders total hours, entry count, and date range of service
  def render_lifetime_summary(pdf)
    total_hours = @approved_hours.sum(:hours).to_f.round(2)
    entry_count = @approved_hours.count
    earliest = @approved_hours.minimum(:service_date)
    latest = @approved_hours.maximum(:service_date)

    pdf.text "Lifetime Service Summary", size: 16, style: :bold, color: SECTION_COLOR
    pdf.move_down 8

    summary_data = [
      ["Total Approved Hours", total_hours.to_s],
      ["Total Entries", entry_count.to_s],
      ["Service Period", format_date_range(earliest, latest)]
    ]

    pdf.table(summary_data, width: pdf.bounds.width, cell_style: { size: 11, padding: [6, 10] }) do
      column(0).font_style = :bold
      column(0).width = 200
    end
    pdf.move_down 15
  end

  # Renders a table of hours broken down by category
  def render_category_breakdown(pdf)
    hours_by_category = @approved_hours.joins(:category).group("categories.name").sum(:hours)
    return if hours_by_category.empty?

    pdf.text "Hours by Category", size: 14, style: :bold, color: SECTION_COLOR
    pdf.move_down 8

    table_data = [["Category", "Hours"]]
    hours_by_category.sort_by { |_, h| -h }.each do |name, hours|
      table_data << [name, hours.to_f.round(2).to_s]
    end

    pdf.table(table_data, header: true, width: pdf.bounds.width) do
      row(0).font_style = :bold
      row(0).background_color = HEADER_BG
      row(0).text_color = HEADER_TEXT
      cells.padding = [6, 10]
    end
    pdf.move_down 15
  end

  # Renders group names with the user's hours contributed to each group
  def render_group_involvement(pdf)
    return if @user.groups.empty?

    pdf.text "Group Involvement", size: 14, style: :bold, color: SECTION_COLOR
    pdf.move_down 8

    table_data = [["Group", "Hours"]]
    @user.groups.each do |group|
      group_hours = @approved_hours.where(group: group).sum(:hours).to_f.round(2)
      table_data << [group.name, group_hours.to_s]
    end

    pdf.table(table_data, header: true, width: pdf.bounds.width) do
      row(0).font_style = :bold
      row(0).background_color = HEADER_BG
      row(0).text_color = HEADER_TEXT
      cells.padding = [6, 10]
    end
    pdf.move_down 15
  end

  # Renders ALL approved service hours — no limit — with title and opportunity columns.
  # Automatically paginates across multiple pages via prawn-table.
  def render_full_service_history(pdf)
    all_hours = @approved_hours
      .includes(:category, :opportunity, :group)
      .order(service_date: :desc)
    return if all_hours.empty?

    pdf.text "Complete Service History", size: 14, style: :bold, color: SECTION_COLOR
    pdf.move_down 8

    table_data = [["Date", "Title", "Category", "Opportunity", "Group", "Hours", "Description"]]
    all_hours.each do |sh|
      table_data << [
        sh.service_date.strftime("%Y-%m-%d"),
        sh.title.presence || "—",
        sh.category&.name || "—",
        sh.opportunity&.title || "—",
        sh.group&.name || "—",
        sh.hours.to_f.round(2).to_s,
        sh.description.truncate(60)
      ]
    end

    pdf.table(table_data, header: true, width: pdf.bounds.width, cell_style: { size: 8 }) do
      row(0).font_style = :bold
      row(0).background_color = HEADER_BG
      row(0).text_color = HEADER_TEXT
      cells.padding = [3, 4]
      # Alternate row shading for readability
      (1...row_length).each do |i|
        row(i).background_color = ROW_ALT_BG if i.odd?
      end
    end
    pdf.move_down 15
  end

  # Renders the official verification/signature block
  def render_verification_block(pdf)
    pdf.stroke_horizontal_rule
    pdf.move_down 20
    pdf.text "Verification", size: 14, style: :bold, color: SECTION_COLOR
    pdf.move_down 10
    pdf.text "This service record has been verified by KCDServe administrators.", size: 10
    pdf.text "Generated on #{Date.current.strftime('%B %d, %Y')}", size: 10, color: "666666"
    pdf.move_down 20
    pdf.text "Signature: ___________________________", size: 10
    pdf.move_down 10
    pdf.text "Date: ___________________________", size: 10
    pdf.move_down 10
    pdf.text "Admin Name: ___________________________", size: 10
  end

  # Adds page numbers to the bottom of every page
  def render_page_numbers(pdf)
    pdf.number_pages "Page <page> of <total>  •  KCDServe Community Service Platform",
                     at: [0, -10],
                     align: :center,
                     size: 8,
                     color: "999999"
  end

  # Formats a date range string, handling nil values gracefully
  #
  # @param earliest [Date, nil] the earliest service date
  # @param latest [Date, nil] the latest service date
  # @return [String] formatted date range or "No service dates"
  def format_date_range(earliest, latest)
    return "No service dates" unless earliest && latest
    "#{earliest.strftime('%B %d, %Y')} — #{latest.strftime('%B %d, %Y')}"
  end
end
