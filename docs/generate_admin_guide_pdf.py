#!/usr/bin/env python3
"""Generate GemFind Ring Builder admin features PDF guide."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUTPUT = Path(__file__).resolve().parent / "GemFind-Ring-Builder-Admin-Features-Guide.pdf"

ACCENT = colors.HexColor("#836a5d")
DARK = colors.HexColor("#262523")
MUTED = colors.HexColor("#6a655e")
LIGHT_BG = colors.HexColor("#f8f4f2")
WHITE = colors.white
BORDER = colors.HexColor("#e8e4e0")
OK = colors.HexColor("#166534")
PARTIAL = colors.HexColor("#b45309")
NOTE = colors.HexColor("#1d4ed8")


def build_styles():
    base = getSampleStyleSheet()
    return {
        "cover_title": ParagraphStyle(
            "CoverTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=28,
            leading=34,
            textColor=WHITE,
            alignment=TA_CENTER,
            spaceAfter=14,
        ),
        "cover_sub": ParagraphStyle(
            "CoverSub",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=13,
            leading=18,
            textColor=colors.HexColor("#f3ece8"),
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=DARK,
            spaceBefore=6,
            spaceAfter=10,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=ACCENT,
            spaceBefore=14,
            spaceAfter=8,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=DARK,
            alignment=TA_JUSTIFY,
            spaceAfter=8,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
            textColor=MUTED,
            spaceAfter=4,
        ),
        "toc": ParagraphStyle(
            "TOC",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=18,
            textColor=DARK,
            leftIndent=12,
        ),
        "cell": ParagraphStyle(
            "Cell",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
            textColor=DARK,
        ),
        "cell_bold": ParagraphStyle(
            "CellBold",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=DARK,
        ),
        "header_cell": ParagraphStyle(
            "HeaderCell",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=11,
            textColor=WHITE,
        ),
    }


def p(text: str, style) -> Paragraph:
    return Paragraph(text.replace("\n", "<br/>"), style)


def feature_table(rows, styles, col_widths):
    data = [
        [
            p("Setting", styles["header_cell"]),
            p("Admin Location", styles["header_cell"]),
            p("What It Does", styles["header_cell"]),
            p("Frontend Display", styles["header_cell"]),
            p("Status", styles["header_cell"]),
        ]
    ]
    for row in rows:
        data.append(
            [
                p(f"<b>{row['name']}</b>", styles["cell"]),
                p(row["location"], styles["cell"]),
                p(row["does"], styles["cell"]),
                p(row["frontend"], styles["cell"]),
                p(row["status"], styles["cell"]),
            ]
        )

    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), ACCENT),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def cover_page(styles):
    cover_data = [
        [Spacer(1, 1.6 * inch)],
        [p("GemFind Ring Builder", styles["cover_title"])],
        [p("WordPress Admin Panel<br/>Features &amp; Frontend Guide", styles["cover_sub"])],
        [Spacer(1, 0.25 * inch)],
        [p("Complete reference for Settings, CSS Configurator,<br/>and storefront behavior", styles["cover_sub"])],
        [Spacer(1, 1.2 * inch)],
        [p("GemFind Digital Solutions", styles["cover_sub"])],
        [p("July 2026", styles["cover_sub"])],
    ]
    cover_table = Table(cover_data, colWidths=[6.5 * inch])
    cover_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), DARK),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    return cover_table


def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.75 * inch, 0.45 * inch, "GemFind Ring Builder — Admin Features Guide")
    canvas.drawRightString(7.75 * inch, 0.45 * inch, f"Page {doc.page}")
    canvas.restoreState()


def main():
    styles = build_styles()
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.65 * inch,
        title="GemFind Ring Builder Admin Features Guide",
        author="GemFind Digital Solutions",
    )

    cw = [1.15 * inch, 1.05 * inch, 1.55 * inch, 1.55 * inch, 0.75 * inch]
    story = []

    story.append(cover_page(styles))
    story.append(PageBreak())

    story.append(p("Table of Contents", styles["h1"]))
    story.append(Spacer(1, 0.12 * inch))
    for item in [
        "1. Overview",
        "2. General Settings",
        "3. Display Settings & Feature Toggles",
        "4. Email & Notifications",
        "5. SEO & Meta Tags",
        "6. Advanced Settings (reCAPTCHA)",
        "7. CSS Configurator",
        "8. About & Getting Started",
        "9. Quick Reference — Storefront URLs",
    ]:
        story.append(p(item, styles["toc"]))
    story.append(PageBreak())

    story.append(p("1. Overview", styles["h1"]))
    story.append(
        p(
            "The GemFind Ring Builder admin panel is available in WordPress under "
            "<b>GemFind Ring Builder</b>. It controls how the ring builder appears on your site, "
            "which shopper tools are enabled, email notifications, SEO metadata, spam protection, "
            "and visual styling.",
            styles["body"],
        )
    )
    story.append(
        p(
            "<b>Main admin areas</b><br/>"
            "• <b>Settings</b> — General, Display, Email, SEO, and Advanced tabs<br/>"
            "• <b>CSS Configurator</b> — Colors and preset themes for Version 2 UI<br/>"
            "• <b>About</b> — Getting started notes and support links",
            styles["body"],
        )
    )
    story.append(
        p(
            "<b>How settings reach the storefront</b><br/>"
            "Saved settings are stored in the plugin database and loaded into the React storefront "
            "at <code>/ringbuilder/</code>. Most display toggles take effect after you click "
            "<b>Save Settings</b> and refresh the storefront page.",
            styles["body"],
        )
    )
    story.append(
        p(
            "<b>Status legend used in this guide</b><br/>"
            "<font color='#166534'><b>Active</b></font> — fully wired in the current Version 2 storefront<br/>"
            "<font color='#b45309'><b>Partial</b></font> — saved in admin but behavior is incomplete or always-on<br/>"
            "<font color='#1d4ed8'><b>Backend</b></font> — affects emails, browser tab, or metadata only (not visible layout)",
            styles["body"],
        )
    )
    story.append(Spacer(1, 0.1 * inch))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceBefore=6, spaceAfter=12))

    story.append(p("2. General Settings", styles["h1"]))
    story.append(p("Tab: Settings → General", styles["h2"]))
    story.append(
        feature_table(
            [
                {
                    "name": "JewelCloud Account ID (Dealer ID)",
                    "location": "Settings → General",
                    "does": "Required connection to your JewelCloud inventory API. Without it, diamonds and mountings cannot load.",
                    "frontend": "Powers all product data on diamond search, mounting search, and detail pages.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Frontend Experience",
                    "location": "Settings → General",
                    "does": "Choose Version 2 (modern React UI) or Version 1 (classic table UI). Switching from v1 to v2 shows a reminder to review CSS Configurator colors.",
                    "frontend": "Changes the entire storefront UI bundle loaded at /ringbuilder/.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Set Mountings Per Page",
                    "location": "Settings → General",
                    "does": "Controls pagination size for the mounting/settings listing (12, 24, 48, or 99 items).",
                    "frontend": "Number of ring settings shown per page at /ringbuilder/settings/.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Mounting Listing Default View",
                    "location": "Settings → General",
                    "does": "Sets whether mountings open in list view or grid view by default.",
                    "frontend": "Initial layout on the settings catalog page.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Carat Ranges",
                    "location": "Settings → General",
                    "does": "Comma-separated carat breakpoints used by diamond filter sliders (e.g. 0.1,0.5,1,1.5,2).",
                    "frontend": "Carat filter steps on the diamond search page.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Shop Title",
                    "location": "Settings → General",
                    "does": "Store name shown in the ring builder header areas.",
                    "frontend": "Large heading above diamond and settings list pages (e.g. your store name under DIAMONDS / SETTINGS).",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Phone Number",
                    "location": "Settings → General",
                    "does": "Contact phone stored in configuration for use in emails and optional display contexts.",
                    "frontend": "May appear in notification emails; not shown as a standalone header element in v2 lists.",
                    "status": "<font color='#1d4ed8'>Backend</font>",
                },
            ],
            styles,
            cw,
        )
    )
    story.append(PageBreak())

    story.append(p("3. Display Settings & Feature Toggles", styles["h1"]))
    story.append(p("Tab: Settings → Display", styles["h2"]))
    story.append(
        p(
            "The Display tab controls shopper-facing tools, pricing format, typography, branding, "
            "and announcement copy. Feature toggles are ON/OFF switches in the Features grid.",
            styles["body"],
        )
    )
    story.append(Spacer(1, 0.08 * inch))
    story.append(p("3.1 Feature Toggles", styles["h2"]))
    story.append(
        feature_table(
            [
                {
                    "name": "Drop-a-Hint",
                    "location": "Display → Features",
                    "does": "Lets a shopper send a gift hint about a diamond or ring to someone else via email form.",
                    "frontend": "Shows <b>Drop A Hint</b> link with gift icon on diamond detail, setting detail, and complete ring pages.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Email a Friend",
                    "location": "Display → Features",
                    "does": "Allows sharing a product link and message with a friend by email.",
                    "frontend": "Shows <b>Email A Friend</b> link with envelope icon on product detail pages.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Schedule Viewing",
                    "location": "Display → Features",
                    "does": "Opens a form to request an in-store or virtual appointment to view the item.",
                    "frontend": "Shows <b>Schedule Viewing</b> link with calendar icon on detail pages.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Request More Info",
                    "location": "Display → Features",
                    "does": "Shows a contact form for questions about the selected diamond or mounting.",
                    "frontend": "Shows <b>Request More Info</b> link with info icon on detail pages.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Print Diamond",
                    "location": "Display → Features",
                    "does": "Enables a printable diamond details view for shoppers.",
                    "frontend": "Shows <b>Print</b> link on diamond-related detail pages when enabled.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Admin Email Notification",
                    "location": "Display → Features",
                    "does": "Intended to control whether the store admin receives a copy when shoppers submit hint, email, viewing, or info forms.",
                    "frontend": "No visible UI. Works with Admin Email Address in Email tab. Currently retailer emails may send whenever an admin email is set, regardless of toggle.",
                    "status": "<font color='#b45309'>Partial</font>",
                },
                {
                    "name": "Sticky Header",
                    "location": "Display → Features",
                    "does": "Intended to pin the top breadcrumb/filter bar while scrolling listing pages.",
                    "frontend": "Headers use sticky CSS by default; the toggle is saved but not yet applied to turn sticky behavior off.",
                    "status": "<font color='#b45309'>Partial</font>",
                },
                {
                    "name": "Show 'Powered by GemFind'",
                    "location": "Display → Features",
                    "does": "Shows GemFind branding credit at the bottom of the ring builder tool.",
                    "frontend": "Footer text <b>Powered by GemFind.</b> at bottom of storefront pages when enabled.",
                    "status": "<font color='#b45309'>Partial</font>",
                },
                {
                    "name": "Show Filter Info",
                    "location": "Display → Features",
                    "does": "Shows small <b>i</b> info icons beside filters and diamond type tabs with explanatory popups.",
                    "frontend": "Info icons on diamond filters, settings filters, and Mined / Lab Grown / Fancy tabs.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Enable Virtual Try-On",
                    "location": "Display → Features",
                    "does": "Enables virtual try-on button when the product supports it in JewelCloud data.",
                    "frontend": "<b>Virtual Try On</b> button on diamond detail, setting detail, and product cards.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Buy Single Diamond",
                    "location": "Display → Features",
                    "does": "Allows purchasing a diamond without selecting a mounting first (standalone diamond cart).",
                    "frontend": "Shows <b>Add To Cart</b> button on diamond detail page alongside Add Your Setting and Virtual Try On.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Show Copyright Notice",
                    "location": "Display → Features",
                    "does": "Intended to show a copyright line in the tool footer or pagination area.",
                    "frontend": "Setting is saved but no visible copyright line is rendered in Version 2 yet.",
                    "status": "<font color='#b45309'>Partial</font>",
                },
            ],
            styles,
            cw,
        )
    )
    story.append(Spacer(1, 0.15 * inch))
    story.append(p("3.2 Other Display Fields", styles["h2"]))
    story.append(
        feature_table(
            [
                {
                    "name": "Currency Symbol Position",
                    "location": "Display",
                    "does": "Places currency symbol left or right of price values (Left or Right).",
                    "frontend": "All prices in listings, filters, cards, and detail pages ($462 vs 462$).",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Font Family",
                    "location": "Display",
                    "does": "Sets the primary storefront font (Helvetica, Arial, Verdana, etc.). Choose Other for a custom name.",
                    "frontend": "Typography across the ring builder React app.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Theme Font Family",
                    "location": "Display (when Font = Other)",
                    "does": "Custom font family name applied when Other is selected.",
                    "frontend": "Custom font on storefront when supported by the visitor's system or theme.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Shop Logo URL",
                    "location": "Display",
                    "does": "URL to your store logo image for branding contexts.",
                    "frontend": "Used where logo display is implemented in the tool configuration.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Announcement Text (List Page)",
                    "location": "Display",
                    "does": "Marketing or instructional copy shown on catalog/list pages.",
                    "frontend": "Paragraph under shop title on diamond list and settings list pages.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Announcement Text (Detail Page)",
                    "location": "Display",
                    "does": "Marketing copy shown on product detail pages.",
                    "frontend": "Text block on diamond detail and setting detail pages above action buttons.",
                    "status": "<font color='#166534'>Active</font>",
                },
            ],
            styles,
            cw,
        )
    )
    story.append(PageBreak())

    story.append(p("4. Email & Notifications", styles["h1"]))
    story.append(p("Tab: Settings → Email / Notifications", styles["h2"]))
    story.append(
        feature_table(
            [
                {
                    "name": "Admin Email Address(es)",
                    "location": "Email / Notifications",
                    "does": "One or more comma-separated email addresses that receive copies of shopper form submissions (Drop a Hint, Email a Friend, Schedule Viewing, Request More Info).",
                    "frontend": "Not visible on storefront. Triggers backend email delivery when forms are submitted.",
                    "status": "<font color='#1d4ed8'>Backend</font>",
                },
            ],
            styles,
            cw,
        )
    )
    story.append(Spacer(1, 0.1 * inch))
    story.append(
        p(
            "<b>Forms protected by reCAPTCHA</b> (when keys are configured under Advanced): Drop a Hint, "
            "Email a Friend, Schedule Viewing, Request More Info, and customer registration. "
            "Each successful submission sends confirmation emails to the shopper and notification emails "
            "to the addresses above.",
            styles["body"],
        )
    )
    story.append(Spacer(1, 0.15 * inch))
    story.append(p("5. SEO & Meta Tags", styles["h1"]))
    story.append(p("Tab: Settings → SEO / Meta", styles["h2"]))
    story.append(
        feature_table(
            [
                {
                    "name": "Mountings Search — Meta Title",
                    "location": "SEO / Meta",
                    "does": "Browser tab title for settings/mounting catalog routes.",
                    "frontend": "Updates document &lt;title&gt; when browsing /ringbuilder/settings/.",
                    "status": "<font color='#1d4ed8'>Backend</font>",
                },
                {
                    "name": "Mountings Search — Meta Description",
                    "location": "SEO / Meta",
                    "does": "Meta description for mounting search pages.",
                    "frontend": "Injected into page meta tags for search engine snippets.",
                    "status": "<font color='#1d4ed8'>Backend</font>",
                },
                {
                    "name": "Mountings Search — Meta Keywords",
                    "location": "SEO / Meta",
                    "does": "Legacy keywords meta tag for mounting pages.",
                    "frontend": "Meta keywords tag on settings catalog routes.",
                    "status": "<font color='#1d4ed8'>Backend</font>",
                },
                {
                    "name": "Diamond Search — Meta Title",
                    "location": "SEO / Meta",
                    "does": "Browser tab title for diamond catalog routes.",
                    "frontend": "Updates document &lt;title&gt; when browsing /ringbuilder/diamondlink/.",
                    "status": "<font color='#1d4ed8'>Backend</font>",
                },
                {
                    "name": "Diamond Search — Meta Description",
                    "location": "SEO / Meta",
                    "does": "Meta description for diamond search pages.",
                    "frontend": "Injected into page meta tags for search engine snippets.",
                    "status": "<font color='#1d4ed8'>Backend</font>",
                },
                {
                    "name": "Diamond Search — Meta Keywords",
                    "location": "SEO / Meta",
                    "does": "Legacy keywords meta tag for diamond pages.",
                    "frontend": "Meta keywords tag on diamond catalog routes.",
                    "status": "<font color='#1d4ed8'>Backend</font>",
                },
                {
                    "name": "Diamond Detail Custom HTML",
                    "location": "SEO / Meta",
                    "does": "Custom HTML or text block inserted on the diamond product detail page body.",
                    "frontend": "Rendered as content block on diamond detail page (above action buttons area).",
                    "status": "<font color='#166534'>Active</font>",
                },
            ],
            styles,
            cw,
        )
    )
    story.append(PageBreak())

    story.append(p("6. Advanced Settings (reCAPTCHA)", styles["h1"]))
    story.append(p("Tab: Settings → Advanced", styles["h2"]))
    story.append(
        feature_table(
            [
                {
                    "name": "Google reCAPTCHA Version",
                    "location": "Advanced",
                    "does": "v2 shows a checkbox on each form. v3 runs invisibly with a site badge and score validation on submit.",
                    "frontend": "Spam protection on public contact/share forms in popups.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Google reCAPTCHA Site Key",
                    "location": "Advanced",
                    "does": "Public key from Google reCAPTCHA admin console.",
                    "frontend": "Loaded by storefront forms to display captcha widget (v2) or obtain token (v3).",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Google reCAPTCHA Secret Key",
                    "location": "Advanced",
                    "does": "Private server-side key used to verify submissions.",
                    "frontend": "Not exposed to shoppers. Validates form posts on the WordPress backend.",
                    "status": "<font color='#1d4ed8'>Backend</font>",
                },
            ],
            styles,
            cw,
        )
    )
    story.append(Spacer(1, 0.15 * inch))
    story.append(p("7. CSS Configurator", styles["h1"]))
    story.append(p("Menu: GemFind Ring Builder → CSS Configurator", styles["h2"]))
    story.append(
        p(
            "The CSS Configurator controls storefront colors for Version 2. Version 1 uses a simplified "
            "three-color panel (Link, Column Header Accent, Call To Action Button).",
            styles["body"],
        )
    )
    story.append(Spacer(1, 0.08 * inch))
    story.append(
        feature_table(
            [
                {
                    "name": "Link Color",
                    "location": "CSS Configurator",
                    "does": "Color for text links and accent text throughout the tool.",
                    "frontend": "Links, utility actions, and accent-colored text.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Column Header Accent",
                    "location": "CSS Configurator",
                    "does": "Background/accent for table headers and highlighted panels.",
                    "frontend": "List/table header backgrounds and accent panels.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Call To Action Button",
                    "location": "CSS Configurator",
                    "does": "Primary button fill and border color (Add Your Setting, Add To Cart, etc.).",
                    "frontend": "All primary pill buttons on detail and listing pages.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Hover Effect",
                    "location": "CSS Configurator (v2)",
                    "does": "Hover state color for interactive elements.",
                    "frontend": "Button and link hover colors.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Slider Effect",
                    "location": "CSS Configurator (v2)",
                    "does": "Color for range slider controls on filter panels.",
                    "frontend": "Carat, price, and other filter sliders.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Background / Background Text",
                    "location": "CSS Configurator (v2)",
                    "does": "Dark background and text on navigation/header areas.",
                    "frontend": "Top navigation bars and dark header sections.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Nav Active / Inactive Colors",
                    "location": "CSS Configurator (v2)",
                    "does": "Four colors for active/inactive tab backgrounds and text (Mined, Lab Grown, Fancy, settings tabs).",
                    "frontend": "Diamond type tabs and settings navigation pills.",
                    "status": "<font color='#166534'>Active</font>",
                },
                {
                    "name": "Select Theme (Presets)",
                    "location": "CSS Configurator (v2)",
                    "does": "One-click palettes: Default View, Blue Ocean, Ruby Red, Golden Glow, and more. Editing any color switches to Custom View.",
                    "frontend": "Instantly recolors the entire storefront theme.",
                    "status": "<font color='#166534'>Active</font>",
                },
            ],
            styles,
            cw,
        )
    )
    story.append(Spacer(1, 0.15 * inch))
    story.append(p("8. About & Getting Started", styles["h1"]))
    story.append(p("Menu: GemFind Ring Builder → About", styles["h2"]))
    story.append(
        p(
            "The About page summarizes initial setup: plugin activation creates a Ring Builder page at "
            "<b>/ringbuilder/</b>, dealer credentials are entered under Settings, shoppers browse mountings at "
            "<b>/ringbuilder/settings/</b> and diamonds at <b>/ringbuilder/diamondlink/</b>, and WooCommerce "
            "is required for add-to-cart checkout flows.",
            styles["body"],
        )
    )
    story.append(
        p(
            "First-time site registration may show a one-time registration form (name, email, phone) "
            "to connect your WordPress site with GemFind support.",
            styles["body"],
        )
    )
    story.append(Spacer(1, 0.15 * inch))
    story.append(p("9. Quick Reference — Storefront URLs", styles["h1"]))
    url_data = [
        [p("<b>Page</b>", styles["header_cell"]), p("<b>URL Path</b>", styles["header_cell"]), p("<b>What Shoppers See</b>", styles["header_cell"])],
        [p("Ring Builder Home", styles["cell"]), p("/ringbuilder/", styles["cell"]), p("Entry point / shortcode mount", styles["cell"])],
        [p("Mounting Catalog", styles["cell"]), p("/ringbuilder/settings/", styles["cell"]), p("Browse and filter ring settings", styles["cell"])],
        [p("Mounting Detail", styles["cell"]), p("/ringbuilder/settings/view/path/…", styles["cell"]), p("Single ring PDP with price, Add Your Diamond, Try On", styles["cell"])],
        [p("Diamond Catalog", styles["cell"]), p("/ringbuilder/diamondlink/", styles["cell"]), p("Browse and filter diamonds", styles["cell"])],
        [p("Diamond Detail", styles["cell"]), p("/ringbuilder/diamondlink/product/…", styles["cell"]), p("Single diamond PDP with specs and action buttons", styles["cell"])],
        [p("Complete Ring", styles["cell"]), p("/ringbuilder/…/completering", styles["cell"]), p("Review selected diamond + mounting combination", styles["cell"])],
    ]
    url_table = Table(url_data, colWidths=[1.4 * inch, 2.4 * inch, 2.7 * inch], repeatRows=1)
    url_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), DARK),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(url_table)
    story.append(Spacer(1, 0.2 * inch))
    story.append(
        p(
            "<i>This guide reflects the GemFind Ring Builder WordPress plugin admin panel as of July 2026. "
            "For support: support@gemfind.com | gemfind.com/free-consultation</i>",
            styles["small"],
        )
    )

    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    print(f"Created: {OUTPUT}")


if __name__ == "__main__":
    main()
