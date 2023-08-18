import datetime
import os
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

ELASTIC_PASSWORD = os.environ.get("ELASTIC_PASSWORD")
#index_name = 'new-index'
index_name = 'history_record'

documents = []

def index(request):
    es = Elasticsearch(
        "https://localhost:9200",
        ca_certs="/etc/elasticsearch/certs/http_ca.crt",
        basic_auth=("elastic", ELASTIC_PASSWORD)
    )
    try:
    # 使用 count API 获取记录数
        response = es.count(index=index_name)

        record_count = response['count']
        print(f"索引 {index_name} 中的记录数: {record_count}")

    except NotFoundError:
        print(f"索引 {index_name} 还不存在")
        record_count = 0
    except Exception as e:
        print("发生错误:", e)

    return render(request, f"taskpane/taskpane.html", context={"record_count":record_count})


def data_Load_index(request):
    
    es = Elasticsearch(
        "https://localhost:9200",
        ca_certs="/etc/elasticsearch/certs/http_ca.crt",
        basic_auth=("elastic", ELASTIC_PASSWORD)
    )
    try:
    # 使用 count API 获取记录数
        response = es.count(index=index_name)

        record_count = response['count']
        print(f"索引 {index_name} 中的记录数: {record_count}")

    except NotFoundError:
        print(f"索引 {index_name} 还不存在")
        record_count = 0
    except Exception as e:
        print("发生错误:", e)

    # response = es.count(index=index_name)
    # record_count = response['count']
    # print(f"索引 {index_name} 中的记录数: {record_count}")
    content = {
        "Index_name": index_name, 
        "record_number":record_count
        }
    return render(request, f"dataLoad/load.html", context=content)


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
    search_results = es.search(index=index_name, body = query)
    for hit in search_results['hits']['hits']:
        print("ID:", hit['_id'])
        
        doc_id = hit['_id']
        doc_source = hit['_source']
        doc_with_id = {'id': doc_id, **doc_source}

        print(doc_with_id)
        return_list.append(doc_with_id)
    
    data = return_list

    return JsonResponse(data, status=200, safe=False)


def Import(request):
    es = Elasticsearch(
        "https://localhost:9200",
        ca_certs="/etc/elasticsearch/certs/http_ca.crt",
        basic_auth=("elastic", ELASTIC_PASSWORD)
    )

    if not es.indices.exists(index=index_name):
        es.indices.create(index=index_name)

    Body = json.loads(request.body)
    object_count = len(Body)
    #count = 1
    for item in Body:
        #print(item)
        try:
            # 使用 index 方法来添加文档，ID 由 Elasticsearch 自动生成
            resp = es.index(index=index_name, document=item)
            print("文档添加成功:", resp)

        except exceptions.RequestError as e:
            print("文档添加失败:", e)

    print(Body)
    print("JSON QA对象数量:", object_count)
    
    return JsonResponse(object_count, status=200, safe=False)


def deleteItem(request):
    doc_id = json.loads(request.body)["id"]
    
    print(doc_id)

    es = Elasticsearch(
        "https://localhost:9200",
        ca_certs="/etc/elasticsearch/certs/http_ca.crt",
        basic_auth=("elastic", ELASTIC_PASSWORD)
    )
    try:
        response = es.delete(index=index_name, id=doc_id)
        print('Document deleted:', response)
        return JsonResponse("Success", status=200, safe=False)
    except Exception as e:
        print('Error deleting document:', e)
        return JsonResponse("Failed", status=404, safe=False)

    

def delete_index(request):
    index_name = json.loads(request.body)["index_name"]

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

    return JsonResponse("Success", status=200, safe=False)




