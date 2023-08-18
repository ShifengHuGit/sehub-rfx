import datetime
import os
import sys
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.views import generic
from django.core.files.storage import FileSystemStorage
from elasticsearch.exceptions import NotFoundError

from elasticsearch import Elasticsearch
from datetime import datetime
import csv

import json
args = sys.argv

ELASTIC_PASSWORD = os.environ.get("ELASTIC_PASSWORD")
index_name = args[1]


es = Elasticsearch(
    "https://localhost:9200",
    ca_certs="/etc/elasticsearch/certs/http_ca.crt",
    basic_auth=("elastic", ELASTIC_PASSWORD)
)

try:
    # 删除索引
    es.indices.delete(index=index_name)
    print(f"索引 {index_name} 的内容已成功清除")

except NotFoundError:
    print(f"索引 {index_name} 不存在")
except Exception as e:
    print("发生错误:", e)


