from fastapi import APIRouter, Query
import http.client
import json

router = APIRouter()

@router.get("/job-search")
async def search_jobs(
    query: str = Query(..., description="Search query, e.g., 'developer jobs in chicago'"),
    page: int = Query(1, description="Page number"),
    num_pages: int = Query(1, description="Number of pages to retrieve"),
    country: str = Query("us", description="Country code"),
    date_posted: str = Query("all", description="Date posted filter")
):
    """Search for jobs based on query parameters."""
    conn = http.client.HTTPSConnection("jsearch.p.rapidapi.com")
    
    headers = {
        'x-rapidapi-key': "9feca646b2mshb54eb8ed2615ab2p12eda5jsna54ef1f207cd",
        'x-rapidapi-host': "jsearch.p.rapidapi.com"
    }
    
    # URL encode the query
    import urllib.parse
    query_encoded = urllib.parse.quote(query)
    
    endpoint = f"/search?query={query_encoded}&page={page}&num_pages={num_pages}&country={country}&date_posted={date_posted}"
    
    conn.request("GET", endpoint, headers=headers)
    
    res = conn.getresponse()
    data = res.read()
    
    return json.loads(data.decode("utf-8"))
