// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

//---------------------
// 获取CSRF Cookie
//---------------------
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  
  
  
  
  
  // The initialize function must be run each time a new page is loaded
  Office.initialize = () => {
    document.getElementById('sideload-msg').style.display = 'none';
    document.getElementById('app-body').style.display = 'flex';
  };
  




  Office.onReady(function(info) {
    if (info.host === Office.HostType.Excel) {
      document.getElementById("getRangeBtn").onclick = getColumnData;
    }
  });
  
  function getColumnData() {
    Excel.run(function(context) {

    var questionRangeAddress = document.getElementById("q_rangeInput").value; 
    var answerRangeAddress =   document.getElementById("a_rangeInput").value; 
    var flagRangeAddress =     document.getElementById("f_rangeInput").value;
    var commentRangeAddress =  document.getElementById("c_rangeInput").value;  
    var otherRangeAddress =    document.getElementById("o_rangeInput").value;
    


    var worksheet = context.workbook.worksheets.getActiveWorksheet();


  
      // 获取指定列的范围
      var column_Q = worksheet.getRange(questionRangeAddress);
      var column_A = worksheet.getRange(answerRangeAddress);
      var column_F = flagRangeAddress ? worksheet.getRange(flagRangeAddress) : null;
      var column_C = commentRangeAddress ? worksheet.getRange(commentRangeAddress) : null;
      var column_O = otherRangeAddress ? worksheet.getRange(otherRangeAddress) : null;
  
      // 加载范围的值，以便在之后可以访问它们
      column_Q.load("values");
      column_A.load("values");
      if (column_F) {
        column_F.load("values");
      }
      if (column_C) {
        column_C.load("values");
      }
      if (column_O) {
        column_O.load("values");
      }
      column_Q.load("rowCount");
  
      return context.sync()
        .then(function() {
          var data = [];
  
          for (var i = 0; i < column_Q.rowCount; i++) {
            var rowData = {
              "Question": column_Q.values[i][0],
              "Answer": column_A.values[i][0],
              "Comment": column_C ? column_C.values[i][0] : null,
              "Flag": column_F ? column_F.values[i][0] : null,
              "Other": column_O ? column_O.values[i][0] : null
            };
  
            data.push(rowData);
          }
  
          var jsonOutput = JSON.stringify(data); // 格式化 JSON 输出
          console.log('Data in JSON format:', jsonOutput);

          var token = getCookie('csrftoken');
  
          $.ajax({
            url: "Import",
            method: 'POST',
            contentType: 'application/json',
            data: jsonOutput,
            headers: {
              'X-CSRFToken': token // 替换为你的CSRF令牌值
            },
      
            success: function (data) {
      

              console.log("POST OK " + data + " 条记录被添加到了ES的Index中");
              var textDiv = document.getElementById('text');
              var recordNumber = data; 
              textDiv.textContent = recordNumber + '条记录插入成功';
              textDiv.style.display = 'block'; // 显示 div

            },
            error: function (error) {
              console.error('POST 请求失败', error);
            }
          });
        });
    }).catch(function(error) {
      console.log('Error:', error);
    });
  }
  