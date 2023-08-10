from elasticsearch import Elasticsearch
import csv

ELASTIC_PASSWORD = "+93KoGQ-Ip4h0DKo=+nR"
documents = []

# Create the client instance
es = Elasticsearch(
    "https://localhost:9200",
    ca_certs="/etc/elasticsearch/certs/http_ca.crt",
    basic_auth=("elastic", ELASTIC_PASSWORD)
)

# 打开 CSV 文件并导入数据到 Elasticsearch
csv_file = 'path_to_your_csv_file.csv'
index_name = 'my_index'
doc_type = '_doc'  # 在较新的 Elasticsearch 版本中，类型已被废弃，文档类型现在被视为 _doc
count = 1

# 读取 Excel 文件为 DataFrame
csv_file = '/home/opc/Rfx_excel/RFX-1.csv'

with open(csv_file, 'r', encoding='utf-8') as file:
    csv_content = file.read().replace('\ufeff', '')
    csv_reader = csv.DictReader(csv_content.splitlines())
    for row in csv_reader:
        #print("Column names:", csv_reader.fieldnames)
        # 获取 "question" 列和 "answer" 列的值
        question = row["Question"]
        answer = row["Answer"]
        
        # 构建文档
        document = {
            question: answer
        }
        resp = es.index(index="test-index", id=count, document=document)
        count+=1
        print(resp['result'])
        # 将文档添加到列表中


