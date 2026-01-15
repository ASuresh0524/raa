"""
Streamlit app for Credentialing Passport system.
"""
import streamlit as st
import requests
from datetime import datetime
from typing import Optional
import json

# Configuration
API_BASE_URL = st.secrets.get("API_BASE_URL", "http://localhost:8000")

st.set_page_config(
    page_title="Credentialing Passport",
    page_icon="🩺",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Initialize session state
if "passport_data" not in st.session_state:
    st.session_state.passport_data = None
if "workflow_data" not in st.session_state:
    st.session_state.workflow_data = None
if "selected_clinician_id" not in st.session_state:
    st.session_state.selected_clinician_id = None


def inject_styles() -> None:
    """Inject global CSS to give a polished SaaS-style look (Medallion-like)."""
    st.markdown(
        """
        <style>
        /* Layout */
        .stApp {
            background: radial-gradient(circle at top left, #0f172a 0, #020617 55%, #020617 100%);
            color: #0f172a;
        }
        .main .block-container {
            max-width: 1200px;
            padding-top: 1.5rem;
            padding-bottom: 3rem;
        }

        /* Top title area */
        .app-hero {
            background: linear-gradient(135deg, #0f172a, #020617);
            border-radius: 16px;
            padding: 1.25rem 1.75rem;
            margin-bottom: 1.25rem;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.75);
            border: 1px solid rgba(148, 163, 184, 0.35);
        }
        .app-hero h1 {
            color: #e5e7eb !important;
            font-size: 1.6rem;
            margin-bottom: 0.15rem;
        }
        .app-hero .subtitle {
            color: #9ca3af;
            font-size: 0.9rem;
        }
        .app-hero .pill {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.25rem 0.7rem;
            border-radius: 999px;
            background: rgba(15, 118, 110, 0.15);
            color: #6ee7b7;
            font-size: 0.75rem;
            font-weight: 500;
            border: 1px solid rgba(16, 185, 129, 0.45);
        }

        /* Sidebar */
        [data-testid="stSidebar"] {
            background: #020617;
            border-right: 1px solid rgba(148, 163, 184, 0.35);
        }
        [data-testid="stSidebar"] h1, 
        [data-testid="stSidebar"] h2, 
        [data-testid="stSidebar"] h3, 
        [data-testid="stSidebar"] p, 
        [data-testid="stSidebar"] label {
            color: #e5e7eb;
        }
        [data-testid="stSidebar"] .stRadio label {
            color: #d1d5db;
            font-size: 0.9rem;
        }

        /* Cards */
        .metric-card, .passport-card, .section-card {
            background: #0b1220;
            border-radius: 14px;
            padding: 1.1rem 1.2rem;
            border: 1px solid rgba(148, 163, 184, 0.55);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.85);
        }
        .section-card h2, .section-card h3 {
            color: #e5e7eb !important;
        }

        /* Passport list items */
        .passport-list-item {
            background: #020617;
            border: 1px solid rgba(148, 163, 184, 0.55);
            border-radius: 12px;
            padding: 1.1rem 1.3rem;
            margin-bottom: 0.75rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.16s ease-out;
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.65);
        }
        .passport-list-item:hover {
            border-color: #60a5fa;
            transform: translateY(-2px);
            box-shadow: 0 24px 55px rgba(15, 23, 42, 0.95);
        }
        .passport-list-item h3 {
            color: #e5e7eb;
            margin-bottom: 0.1rem;
        }
        .passport-list-item .text-light {
            color: #9ca3af;
        }

        /* Buttons */
        .stButton>button {
            background: linear-gradient(135deg, #2563eb, #4f46e5);
            color: #f9fafb;
            border-radius: 999px;
            padding: 0.45rem 1.1rem;
            border: 1px solid rgba(191, 219, 254, 0.25);
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 12px 30px rgba(37, 99, 235, 0.35);
            transition: all 0.14s ease-out;
        }
        .stButton>button:hover {
            transform: translateY(-1px);
            box-shadow: 0 18px 40px rgba(37, 99, 235, 0.55);
        }

        /* Metrics */
        [data-testid="stMetric"] {
            background: #020617;
            border-radius: 14px;
            padding: 0.8rem 1rem;
            border: 1px solid rgba(148, 163, 184, 0.45);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.85);
        }

        /* Expander tweaks */
        details[data-testid="stExpander"] {
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.45);
            background: #020617;
        }

        /* Text utilities */
        .text-light {
            color: #9ca3af;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def format_date(date_str: str) -> str:
    """Format date string for display."""
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00")).strftime("%b %d, %Y")
    except:
        return date_str


def api_request(method: str, endpoint: str, **kwargs) -> Optional[dict]:
    """Make API request with error handling."""
    try:
        url = f"{API_BASE_URL}{endpoint}"
        if method == "GET":
            response = requests.get(url, **kwargs)
        elif method == "POST":
            response = requests.post(url, json=kwargs.get("json"), **{k: v for k, v in kwargs.items() if k != "json"})
        elif method == "PUT":
            response = requests.put(url, json=kwargs.get("json"), **{k: v for k, v in kwargs.items() if k != "json"})
        else:
            return None
        
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"API Error: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        st.error(f"❌ Cannot connect to backend API at {API_BASE_URL}. Make sure the FastAPI server is running.")
        return None
    except Exception as e:
        st.error(f"Error: {str(e)}")
        return None


def main():
    inject_styles()

    # Hero header
    hero_col1, hero_col2 = st.columns([3, 1])
    with hero_col1:
        st.markdown(
            """
            <div class="app-hero">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;">
                <div>
                  <h1>Credentialing Passport for Clinicians</h1>
                  <p class="subtitle">Fill once, reuse everywhere. Medallion-style automation for end-to-end credentialing and payer enrollment.</p>
                </div>
                <div style="text-align:right;">
                  <span class="pill">● Live · Demo Environment</span>
                </div>
              </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with hero_col2:
        st.metric("API Base URL", API_BASE_URL.replace("http://", "").replace("https://", ""))

    # Sidebar navigation
    with st.sidebar:
        st.header("Navigation")
        page = st.radio(
            "Select Page",
            [
                "📋 Passport List",
                "➕ Create Passport",
                "👤 View Passport",
                "🏥 Organization View",
                "🔄 Workflows",
                "📊 Quality Reports",
            ],
            key="nav_page"
        )
        st.markdown("---")
        
        if st.session_state.selected_clinician_id:
            st.info(f"Selected: `{st.session_state.selected_clinician_id}`")
            if st.button("Clear Selection"):
                st.session_state.selected_clinician_id = None
                st.session_state.passport_data = None
                st.rerun()

    # Passport List Page
    if page == "📋 Passport List":
        st.header("Clinician Passports")
        
        if st.button("🔄 Refresh List"):
            st.rerun()
        
        passports = api_request("GET", "/api/passports")
        
        if passports:
            if len(passports) == 0:
                st.info("No passports found. Create your first passport!")
            else:
                st.success(f"Found {len(passports)} passport(s)")
                
                for passport in passports:
                    with st.expander(f"👤 {passport.get('identity', {}).get('legal_name', 'Unnamed')} - {passport.get('clinician_id', 'N/A')}"):
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.write(f"**Email:** {passport.get('identity', {}).get('email', 'N/A')}")
                            st.write(f"**Phone:** {passport.get('identity', {}).get('phone', 'N/A')}")
                        with col2:
                            licenses_count = len(passport.get('licenses', {}).get('state_licenses', []))
                            st.write(f"**Licenses:** {licenses_count}")
                            certs_count = len(passport.get('board_certifications', []))
                            st.write(f"**Certifications:** {certs_count}")
                        with col3:
                            st.write(f"**Updated:** {format_date(passport.get('updated_at', ''))}")
                        
                        if st.button(f"View Details", key=f"view_{passport.get('clinician_id')}"):
                            st.session_state.selected_clinician_id = passport.get('clinician_id')
                            st.session_state.passport_data = passport
                            st.rerun()

    # Create Passport Page
    elif page == "➕ Create Passport":
        st.header("Create New Passport")
        
        with st.form("create_passport_form"):
            clinician_id = st.text_input("Clinician ID *", placeholder="e.g., clinician-001")
            legal_name = st.text_input("Legal Name *", placeholder="Dr. John Doe")
            email = st.text_input("Email *", placeholder="john.doe@example.com")
            phone = st.text_input("Phone", placeholder="555-123-4567")
            dob = st.date_input("Date of Birth")
            
            submitted = st.form_submit_button("Create Passport", type="primary")
            
            if submitted:
                if not clinician_id or not legal_name or not email:
                    st.error("Please fill in all required fields (marked with *)")
                else:
                    passport_data = {
                        "clinician_id": clinician_id,
                        "identity": {
                            "legal_name": legal_name,
                            "aliases": [],
                            "date_of_birth": dob.isoformat() if dob else datetime.now().date().isoformat(),
                            "email": email,
                            "phone": phone or "",
                            "address_history": []
                        },
                        "education": [],
                        "training": [],
                        "work_history": [],
                        "hospital_affiliations": [],
                        "licenses": {
                            "state_licenses": [],
                            "cds_registrations": []
                        },
                        "board_certifications": [],
                        "disclosures": [],
                        "references": [],
                        "enrollment": {
                            "practice_locations": [],
                            "w9_on_file": False,
                            "specialties": [],
                            "taxonomies": []
                        },
                        "documents": [],
                        "created_at": datetime.utcnow().isoformat(),
                        "updated_at": datetime.utcnow().isoformat()
                    }
                    
                    result = api_request("POST", "/api/passport", json=passport_data)
                    if result:
                        st.success(f"✅ Passport created successfully for {legal_name}!")
                        st.session_state.selected_clinician_id = clinician_id
                        st.session_state.passport_data = result
                        st.rerun()

    # View Passport Page
    elif page == "👤 View Passport":
        st.header("View Passport Details")
        
        # Clinician ID selector
        if not st.session_state.selected_clinician_id:
            clinician_id_input = st.text_input("Enter Clinician ID", placeholder="clinician-001")
            if st.button("Load Passport"):
                if clinician_id_input:
                    st.session_state.selected_clinician_id = clinician_id_input
                    st.rerun()
        else:
            clinician_id = st.session_state.selected_clinician_id
            
            # Load passport data
            if not st.session_state.passport_data:
                passport_response = api_request("GET", f"/api/passport/{clinician_id}")
                if passport_response:
                    st.session_state.passport_data = passport_response.get("passport")
            
            if st.session_state.passport_data:
                passport = st.session_state.passport_data
                
                # Header info
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Legal Name", passport.get("identity", {}).get("legal_name", "N/A"))
                with col2:
                    st.metric("Email", passport.get("identity", {}).get("email", "N/A"))
                with col3:
                    st.metric("Phone", passport.get("identity", {}).get("phone", "N/A"))
                
                # Tabs for different sections
                tab1, tab2, tab3, tab4, tab5 = st.tabs([
                    "📝 Identity", "🎓 Education", "📜 Licenses", "💼 Work History", "📄 Documents"
                ])
                
                with tab1:
                    st.subheader("Identity & Demographics")
                    identity = passport.get("identity", {})
                    st.write(f"**Legal Name:** {identity.get('legal_name', 'N/A')}")
                    st.write(f"**Date of Birth:** {format_date(identity.get('date_of_birth', ''))}")
                    st.write(f"**Email:** {identity.get('email', 'N/A')}")
                    st.write(f"**Phone:** {identity.get('phone', 'N/A')}")
                    if identity.get("aliases"):
                        st.write(f"**Aliases:** {', '.join(identity.get('aliases', []))}")
                
                with tab2:
                    st.subheader("Education & Training")
                    education = passport.get("education", [])
                    training = passport.get("training", [])
                    
                    if education:
                        st.write("**Education:**")
                        for edu in education:
                            st.write(f"- {edu.get('degree')} from {edu.get('institution')} ({format_date(edu.get('start_date', ''))} - {format_date(edu.get('end_date', ''))})")
                    
                    if training:
                        st.write("**Training:**")
                        for train in training:
                            st.write(f"- {train.get('program_name')} ({train.get('specialty')}) at {train.get('institution')}")
                    
                    if not education and not training:
                        st.info("No education or training records yet.")
                
                with tab3:
                    st.subheader("Licenses & Certifications")
                    
                    licenses = passport.get("licenses", {}).get("state_licenses", [])
                    if licenses:
                        st.write("**State Licenses:**")
                        for lic in licenses:
                            st.write(f"- {lic.get('state')}: {lic.get('license_number')} ({lic.get('status')}) - Expires: {format_date(lic.get('expiration_date', ''))}")
                    else:
                        st.info("No licenses recorded yet.")
                    
                    board_certs = passport.get("board_certifications", [])
                    if board_certs:
                        st.write("**Board Certifications:**")
                        for cert in board_certs:
                            st.write(f"- {cert.get('specialty')} from {cert.get('board_name')} ({cert.get('status')})")
                    else:
                        st.info("No board certifications recorded yet.")
                
                with tab4:
                    st.subheader("Work History")
                    work_history = passport.get("work_history", [])
                    if work_history:
                        for work in work_history:
                            st.write(f"**{work.get('position')}** at {work.get('employer')}")
                            st.write(f"{format_date(work.get('start_date', ''))} - {format_date(work.get('end_date', '')) if work.get('end_date') else 'Present'}")
                            st.write("---")
                    else:
                        st.info("No work history recorded yet.")
                
                with tab5:
                    st.subheader("Documents")
                    documents = passport.get("documents", [])
                    if documents:
                        for doc in documents:
                            st.write(f"- {doc.get('file_name')} ({doc.get('document_type')}) - Uploaded: {format_date(doc.get('upload_date', ''))}")
                    else:
                        st.info("No documents uploaded yet.")
                    
                    # Upload new document
                    uploaded_file = st.file_uploader("Upload Document", type=['pdf', 'doc', 'docx', 'jpg', 'png'])
                    if uploaded_file:
                        if st.button("Upload"):
                            try:
                                files = {"file": (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)}
                                params = {
                                    "clinician_id": clinician_id,
                                    "document_type": "supporting_document"
                                }
                                response = requests.post(
                                    f"{API_BASE_URL}/api/documents/upload",
                                    files=files,
                                    params=params
                                )
                                if response.status_code == 200:
                                    st.success("Document uploaded successfully!")
                                    st.session_state.passport_data = None  # Refresh
                                    st.rerun()
                                else:
                                    st.error(f"Upload failed: {response.text}")
                            except Exception as e:
                                st.error(f"Error: {str(e)}")
                
                # Workflow section
                st.markdown("---")
                st.subheader("Start Credentialing Workflow")
                
                col1, col2 = st.columns(2)
                with col1:
                    destination_id = st.text_input("Destination ID", placeholder="hospital-001")
                with col2:
                    destination_type = st.selectbox(
                        "Destination Type",
                        ["hospital", "group", "staffing_firm", "telehealth"]
                    )
                
                if st.button("🚀 Authorize Access & Start Workflow", type="primary"):
                    if destination_id:
                        auth_data = {
                            "destination_id": destination_id,
                            "destination_type": destination_type,
                            "scoped_permissions": []
                        }
                        workflow = api_request("POST", f"/api/passport/{clinician_id}/authorize", json=auth_data)
                        if workflow:
                            st.success("✅ Workflow started successfully!")
                            st.session_state.workflow_data = workflow
                            # Kick orchestrator run (end-to-end agents)
                            api_request("POST", f"/api/workflow/{workflow.get('workflow_id')}/run")
                            st.rerun()
                    else:
                        st.error("Please enter a destination ID")

    # Organization View
    elif page == "🏥 Organization View":
        st.header("Organization Dashboard")
        st.caption("Review exceptions (not raw paperwork). Track ETA, tasks, and download evidence bundle.")

        workflow_id = st.text_input("Workflow ID", placeholder="wf-xxxxx")
        colA, colB = st.columns([1, 1])
        with colA:
            refresh = st.button("🔄 Refresh Status")
        with colB:
            auto_refresh = st.checkbox("Auto-refresh (10s)", value=False)

        if auto_refresh:
            st.caption("Auto-refresh enabled. This will refresh the page every 10 seconds.")
            st.experimental_set_query_params(_ts=str(int(datetime.utcnow().timestamp())))
            st.sleep(10)
            st.rerun()

        if workflow_id and (refresh or True):
            wf_status = api_request("GET", f"/api/workflow/{workflow_id}")
            if wf_status:
                wf = wf_status.get("workflow", {})
                progress = wf_status.get("progress_percentage", 0)
                st.subheader(f"Workflow: {wf.get('workflow_id')}")
                st.progress(progress / 100)
                st.write(f"**Destination:** {wf.get('destination_id')} ({wf.get('destination_type')})")
                st.write(f"**Overall Status:** {wf.get('status')}")

                exceptions = wf.get("exceptions") or []
                if exceptions:
                    st.warning("Exceptions")
                    for e in exceptions:
                        st.write(f"- {e}")
                else:
                    st.success("No exceptions currently flagged.")

                st.markdown("### Live Status Timeline")
                timeline = wf_status.get("timeline", [])
                for t in timeline:
                    st.write(f"- **{t.get('agent_name')}**: {t.get('status')} (start: {t.get('started_at')}, end: {t.get('completed_at')})")

                st.markdown("### Agent Task Runs")
                for tr in wf_status.get("task_runs", []):
                    with st.expander(f"{tr.get('agent_name')} — {tr.get('status')}"):
                        st.json(tr.get("output") or {})
                        if tr.get("exceptions"):
                            st.warning("Exception payload")
                            st.json(tr.get("exceptions"))

                st.markdown("### Audit Trail (most recent)")
                for ev in wf_status.get("audit_events", [])[:25]:
                    st.write(f"- `{ev.get('created_at')}` **{ev.get('actor')}** → {ev.get('action')}")

                # Evidence bundle download
                evidence = wf.get("evidence_bundle")
                if evidence:
                    st.markdown("### Evidence Bundle")
                    st.download_button(
                        "⬇️ Download Evidence Bundle (JSON)",
                        data=json.dumps(evidence, indent=2),
                        file_name=f"evidence-{workflow_id}.json",
                        mime="application/json",
                    )
                else:
                    st.info("Evidence bundle not available yet. Run the workflow to generate it.")

    # Workflows Page
    elif page == "🔄 Workflows":
        st.header("Credentialing Workflows")
        
        if st.session_state.workflow_data:
            workflow = st.session_state.workflow_data
            st.subheader(f"Workflow: {workflow.get('workflow_id', 'N/A')}")
            
            # Get detailed workflow status
            workflow_status = api_request("GET", f"/api/workflow/{workflow.get('workflow_id')}")
            
            if workflow_status:
                workflow_obj = workflow_status.get("workflow", {})
                progress = workflow_status.get("progress_percentage", 0)
                
                st.progress(progress / 100)
                st.write(f"**Progress:** {progress:.0f}%")
                st.write(f"**Status:** {workflow_obj.get('status', 'N/A')}")
                st.write(f"**Destination:** {workflow_obj.get('destination_id')} ({workflow_obj.get('destination_type')})")
                
                st.subheader("Workflow Steps")
                steps = workflow_obj.get("steps", [])
                for step in steps:
                    status_emoji = {
                        "completed": "✅",
                        "in_progress": "🔄",
                        "pending_review": "⏳",
                        "pending": "⏸️"
                    }.get(step.get("status", "").lower(), "❓")
                    
                    st.write(f"{status_emoji} **{step.get('agent_name')}** - {step.get('status', 'N/A')}")
                
                if workflow_obj.get("exceptions"):
                    st.warning("**Exceptions:**")
                    for exc in workflow_obj.get("exceptions", []):
                        st.write(f"- {exc}")
            else:
                st.info("No active workflow. Start one from the View Passport page.")
        else:
            st.info("No workflow selected. Start a workflow from the View Passport page.")

    # Quality Reports Page
    elif page == "📊 Quality Reports":
        st.header("Data Quality Reports")
        
        clinician_id = st.text_input("Enter Clinician ID", placeholder="clinician-001")
        
        if st.button("Generate Quality Report"):
            if clinician_id:
                quality_report = api_request("GET", f"/api/passport/{clinician_id}/quality")
                
                if quality_report:
                    completeness = quality_report.get("completeness_score", 0) * 100
                    st.metric("Completeness Score", f"{completeness:.0f}%")
                    
                    issues = quality_report.get("issues", [])
                    if issues:
                        st.subheader("Quality Issues")
                        for issue in issues:
                            severity_colors = {
                                "critical": "🔴",
                                "high": "🟠",
                                "medium": "🟡",
                                "low": "🟢"
                            }
                            severity_emoji = severity_colors.get(issue.get("severity", "").lower(), "⚪")
                            
                            with st.expander(f"{severity_emoji} {issue.get('field_name')} - {issue.get('severity', '').upper()}"):
                                st.write(f"**Issue:** {issue.get('description')}")
                                if issue.get("suggested_fix"):
                                    st.write(f"**Suggested Fix:** {issue.get('suggested_fix')}")
                                st.write(f"**Type:** {issue.get('issue_type')}")
                    else:
                        st.success("✅ No quality issues found! Passport is complete and consistent.")
                else:
                    st.error("Failed to generate quality report. Make sure the clinician ID exists.")
            else:
                st.error("Please enter a clinician ID")


if __name__ == "__main__":
    main()

