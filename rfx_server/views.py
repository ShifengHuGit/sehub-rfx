import datetime
import os
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.views import generic
from django.core.files.storage import FileSystemStorage

from elasticsearch import Elasticsearch
from datetime import datetime
import csv

import json

ELASTIC_PASSWORD = os.environ.get("ELASTIC_PASSWORD")


documents = []

def index(request):
    return render(request, "taskpane/taskpane.html")


def Search(request):
    return_list = []
    es = Elasticsearch(
        "https://localhost:9200",
        ca_certs="/etc/elasticsearch/certs/http_ca.crt",
        basic_auth=("elastic", ELASTIC_PASSWORD)
    )
    selectedText = json.loads(request.body)["selectedText"]
    print(selectedText)
    
    search_keyword = selectedText

    query = {
        "query": {
            "query_string": {
                "query": f"*{search_keyword}*"
            }
        }
    }
    search_results = es.search(index="test-index", body = query)
    for hit in search_results['hits']['hits']:
        print(hit['_source'])
        return_list.append(hit['_source'])
    
    data = return_list

    return JsonResponse(data, status=200, safe=False)

