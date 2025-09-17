from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class ReportStatus(str, Enum):
    SUBMITTED = "submitted"
    PROCESSED = "processed"
    UNDER_REVIEW = "under_review"
    HIGH_PRIORITY = "high_priority"

class WaterSource(str, Enum):
    BOREWELL = "borewell"
    RIVER = "river"
    LAKE = "lake"
    POND = "pond"
    WELL = "well"
    TAP = "tap"
    SPRING = "spring"

# Models
class WaterQualityReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location_name: str
    district: str
    water_source: WaterSource
    collection_date: datetime
    collection_time: str
    collector_name: str
    collector_id: str
    phone_number: str
    ph_level: Optional[float] = None
    turbidity: Optional[float] = None
    chlorine: Optional[float] = None
    e_coli: Optional[int] = None
    total_coliform: Optional[int] = None
    tds: Optional[float] = None
    status: ReportStatus = ReportStatus.SUBMITTED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PatientReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_name: str
    age: int
    gender: str
    location_name: str
    district: str
    symptoms: List[str]
    suspected_disease: str
    water_source_used: WaterSource
    reporter_name: str
    reporter_phone: str
    report_date: datetime = Field(default_factory=datetime.utcnow)
    status: ReportStatus = ReportStatus.SUBMITTED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FAQ(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    category: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Query(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_name: str
    phone_number: str
    question: str
    status: str = "pending"
    response: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReportStats(BaseModel):
    total_submitted: int
    total_processed: int
    under_review: int
    high_priority: int

class District(BaseModel):
    name: str
    state: str

# Northeast India districts data
NORTHEAST_DISTRICTS = [
    {"name": "Kamrup", "state": "Assam"},
    {"name": "Jorhat", "state": "Assam"},
    {"name": "Sivasagar", "state": "Assam"},
    {"name": "Dibrugarh", "state": "Assam"},
    {"name": "Tinsukia", "state": "Assam"},
    {"name": "Golaghat", "state": "Assam"},
    {"name": "Nagaon", "state": "Assam"},
    {"name": "Sonitpur", "state": "Assam"},
    {"name": "East Garo Hills", "state": "Meghalaya"},
    {"name": "West Garo Hills", "state": "Meghalaya"},
    {"name": "East Khasi Hills", "state": "Meghalaya"},
    {"name": "West Khasi Hills", "state": "Meghalaya"},
    {"name": "Ri Bhoi", "state": "Meghalaya"},
    {"name": "East Jaintia Hills", "state": "Meghalaya"},
    {"name": "West Jaintia Hills", "state": "Meghalaya"},
    {"name": "North Garo Hills", "state": "Meghalaya"},
    {"name": "South West Garo Hills", "state": "Meghalaya"},
    {"name": "South Garo Hills", "state": "Meghalaya"},
    {"name": "South West Khasi Hills", "state": "Meghalaya"},
    {"name": "Imphal East", "state": "Manipur"},
    {"name": "Imphal West", "state": "Manipur"},
    {"name": "Bishnupur", "state": "Manipur"},
    {"name": "Thoubal", "state": "Manipur"},
    {"name": "Churachandpur", "state": "Manipur"},
    {"name": "Mon", "state": "Nagaland"},
    {"name": "Tuensang", "state": "Nagaland"},
    {"name": "Kohima", "state": "Nagaland"},
    {"name": "Dimapur", "state": "Nagaland"},
    {"name": "Wokha", "state": "Nagaland"},
    {"name": "Zunheboto", "state": "Nagaland"},
    {"name": "Mokokchung", "state": "Nagaland"},
    {"name": "Phek", "state": "Nagaland"},
    {"name": "West Tripura", "state": "Tripura"},
    {"name": "North Tripura", "state": "Tripura"},
    {"name": "South Tripura", "state": "Tripura"},
    {"name": "Dhalai", "state": "Tripura"},
    {"name": "Gomati", "state": "Tripura"},
    {"name": "Khowai", "state": "Tripura"},
    {"name": "Sepahijala", "state": "Tripura"},
    {"name": "Unakoti", "state": "Tripura"},
    {"name": "Aizawl", "state": "Mizoram"},
    {"name": "Lunglei", "state": "Mizoram"},
    {"name": "Champhai", "state": "Mizoram"},
    {"name": "Kolasib", "state": "Mizoram"},
    {"name": "Lawngtlai", "state": "Mizoram"},
    {"name": "Mamit", "state": "Mizoram"},
    {"name": "Saiha", "state": "Mizoram"},
    {"name": "Serchhip", "state": "Mizoram"}
]

# FAQ data
FAQ_DATA = [
    {
        "question": "How do I report a suspected waterborne disease outbreak?",
        "answer": "To report a suspected waterborne disease outbreak, go to the Reports section, tap 'Submit New Report', select 'Patient Report', and fill in all the required details including symptoms, suspected disease, and location information.",
        "category": "reporting"
    },
    {
        "question": "What should I do if my water supply seems contaminated?",
        "answer": "If your water supply seems contaminated, stop using it immediately for drinking or cooking. Report it through the app's water quality report feature, boil water before use, and contact local health authorities.",
        "category": "safety"
    },
    {
        "question": "What are the symptoms of waterborne diseases I should watch for?",
        "answer": "Common symptoms include diarrhea, vomiting, stomach cramps, fever, headache, and dehydration. Severe symptoms may include blood in stool, high fever, and persistent vomiting.",
        "category": "health"
    },
    {
        "question": "How can I prevent waterborne diseases?",
        "answer": "Boil water for at least 1 minute before drinking, use water purification tablets, maintain proper hygiene, wash hands frequently, and ensure proper sanitation around water sources.",
        "category": "prevention"
    },
    {
        "question": "Where can I get my water tested for quality?",
        "answer": "You can get water tested at government health centers, certified private labs, or use home testing kits. Contact your local health department for authorized testing facilities in your area.",
        "category": "testing"
    },
    {
        "question": "What emergency supplies should I keep during an outbreak?",
        "answer": "Keep bottled water, water purification tablets, oral rehydration salts (ORS), basic medicines, hand sanitizer, and emergency contact numbers readily available.",
        "category": "emergency"
    },
    {
        "question": "How do I access free medical treatment during an outbreak?",
        "answer": "Contact your nearest Primary Health Center (PHC), Community Health Center (CHC), or district hospital. Government health facilities provide free treatment during disease outbreaks.",
        "category": "treatment"
    }
]

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Jal Drishti API - Water Quality Monitoring System"}

# Districts
@api_router.get("/districts", response_model=List[District])
async def get_districts():
    return [District(**district) for district in NORTHEAST_DISTRICTS]

# Water Quality Reports
@api_router.post("/water-reports", response_model=WaterQualityReport)
async def create_water_report(report: WaterQualityReport):
    report_dict = report.dict()
    await db.water_reports.insert_one(report_dict)
    return report

@api_router.get("/water-reports", response_model=List[WaterQualityReport])
async def get_water_reports(limit: int = 50):
    reports = await db.water_reports.find().sort("created_at", -1).limit(limit).to_list(length=limit)
    return [WaterQualityReport(**report) for report in reports]

@api_router.get("/water-reports/{report_id}", response_model=WaterQualityReport)
async def get_water_report(report_id: str):
    report = await db.water_reports.find_one({"id": report_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return WaterQualityReport(**report)

# Patient Reports
@api_router.post("/patient-reports", response_model=PatientReport)
async def create_patient_report(report: PatientReport):
    report_dict = report.dict()
    await db.patient_reports.insert_one(report_dict)
    return report

@api_router.get("/patient-reports", response_model=List[PatientReport])
async def get_patient_reports(limit: int = 50):
    reports = await db.patient_reports.find().sort("created_at", -1).limit(limit).to_list(length=limit)
    return [PatientReport(**report) for report in reports]

# Report Statistics
@api_router.get("/report-stats", response_model=ReportStats)
async def get_report_stats():
    # Count water reports
    water_submitted = await db.water_reports.count_documents({"status": "submitted"})
    water_processed = await db.water_reports.count_documents({"status": "processed"})
    water_under_review = await db.water_reports.count_documents({"status": "under_review"})
    water_high_priority = await db.water_reports.count_documents({"status": "high_priority"})
    
    # Count patient reports
    patient_submitted = await db.patient_reports.count_documents({"status": "submitted"})
    patient_processed = await db.patient_reports.count_documents({"status": "processed"})
    patient_under_review = await db.patient_reports.count_documents({"status": "under_review"})
    patient_high_priority = await db.patient_reports.count_documents({"status": "high_priority"})
    
    return ReportStats(
        total_submitted=water_submitted + patient_submitted,
        total_processed=water_processed + patient_processed,
        under_review=water_under_review + patient_under_review,
        high_priority=water_high_priority + patient_high_priority
    )

# Recent Activity
@api_router.get("/recent-activity")
async def get_recent_activity(limit: int = 10):
    # Get recent water reports
    water_reports = await db.water_reports.find().sort("created_at", -1).limit(limit//2).to_list(length=limit//2)
    
    # Get recent patient reports
    patient_reports = await db.patient_reports.find().sort("created_at", -1).limit(limit//2).to_list(length=limit//2)
    
    activities = []
    
    for report in water_reports:
        activities.append({
            "id": report["id"],
            "type": "water_report",
            "title": f"Water Quality Report - {report['location_name']}",
            "location": f"{report['location_name']}, {report['district']}",
            "status": report["status"],
            "created_at": report["created_at"]
        })
    
    for report in patient_reports:
        activities.append({
            "id": report["id"],
            "type": "patient_report", 
            "title": f"Patient Report - {report['suspected_disease']}",
            "location": f"{report['location_name']}, {report['district']}",
            "status": report["status"],
            "created_at": report["created_at"]
        })
    
    # Sort by created_at and return top activities
    activities.sort(key=lambda x: x["created_at"], reverse=True)
    return activities[:limit]

# FAQ
@api_router.get("/faqs", response_model=List[FAQ])
async def get_faqs():
    faqs = await db.faqs.find().to_list(length=100)
    if not faqs:
        # Initialize FAQ data if empty
        for faq_data in FAQ_DATA:
            faq = FAQ(**faq_data)
            await db.faqs.insert_one(faq.dict())
        
        faqs = await db.faqs.find().to_list(length=100)
    
    return [FAQ(**faq) for faq in faqs]

@api_router.get("/faqs/search")
async def search_faqs(q: str):
    faqs = await db.faqs.find({
        "$or": [
            {"question": {"$regex": q, "$options": "i"}},
            {"answer": {"$regex": q, "$options": "i"}}
        ]
    }).to_list(length=50)
    return [FAQ(**faq) for faq in faqs]

# Queries
@api_router.post("/queries", response_model=Query)
async def create_query(query: Query):
    query_dict = query.dict()
    await db.queries.insert_one(query_dict)
    return query

@api_router.get("/queries", response_model=List[Query])
async def get_queries(limit: int = 50):
    queries = await db.queries.find().sort("created_at", -1).limit(limit).to_list(length=limit)
    return [Query(**query) for query in queries]

# Map locations - get reports with coordinates
@api_router.get("/map-locations")
async def get_map_locations():
    # Get water reports with coordinates
    water_reports = await db.water_reports.find({
        "latitude": {"$exists": True, "$ne": None},
        "longitude": {"$exists": True, "$ne": None}
    }).to_list(length=200)
    
    # Get patient reports with coordinates  
    patient_reports = await db.patient_reports.find({
        "latitude": {"$exists": True, "$ne": None},
        "longitude": {"$exists": True, "$ne": None}
    }).to_list(length=200)
    
    locations = []
    
    for report in water_reports:
        locations.append({
            "id": report["id"],
            "type": "water_report",
            "title": f"Water Quality - {report['location_name']}",
            "latitude": report["latitude"],
            "longitude": report["longitude"],
            "status": report["status"],
            "description": f"Water source: {report['water_source']}, pH: {report.get('ph_level', 'N/A')}"
        })
    
    for report in patient_reports:
        locations.append({
            "id": report["id"],
            "type": "patient_report",
            "title": f"Health Alert - {report['suspected_disease']}",
            "latitude": report["latitude"],
            "longitude": report["longitude"],
            "status": report["status"],
            "description": f"Patient: {report['patient_name']}, Age: {report['age']}"
        })
    
    return locations

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()