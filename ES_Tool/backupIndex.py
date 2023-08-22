import datetime
import os
from elasticsearch.exceptions import NotFoundError
from elasticsearch import Elasticsearch
from datetime import datetime
import json

ELASTIC_PASSWORD = os.environ.get("ELASTIC_PASSWORD")
index_name = 'history_record'

es = Elasticsearch(
        "https://localhost:9200",
        ca_certs="/etc/elasticsearch/certs/http_ca.crt",
        basic_auth=("elastic", ELASTIC_PASSWORD)
    )
es.snapshot.create(
    repository='my_backup_repo',   # 仓库名称
    snapshot='my_snapshot',        # 快照名称
    body={
        'indices': 'index_name',    # 要备份的索引名称
        'ignore_unavailable': True,
        'include_global_state': False
    }
)