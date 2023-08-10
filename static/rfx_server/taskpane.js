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



//
// 选择 关键字, 异步的处理 去后台AJAX查询
//
let selectedText = ''; // 用于存储选中的文本
const selectedCard = document.getElementById('selected-card');
const questionArea = document.getElementById('text');

questionArea.addEventListener('mouseup', () => {
  selectedText = window.getSelection().toString();
  if (selectedText !== '') {
    console.log('选中的内容：', selectedText);

    selectedCard.style.display = 'flex'; // 显示div
    selectedCard.classList.add('show');
    document.getElementById('selected-text').innerText = selectedText;
    var token = getCookie('csrftoken');

    $.ajax({
      url: "Search",
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ selectedText: selectedText }),
      headers: {
        'X-CSRFToken': token // 替换为你的CSRF令牌值
      },

      success: function (data) {

        var resultContainer = document.getElementById("selected-card");

        // 显示结果之前,清楚上次的显示结果
        // 清除之前通过 JavaScript 添加的子元素（带有特定类名的元素）
        var addedDivs = resultContainer.querySelectorAll(".added-div");
        addedDivs.forEach(function (div) {
          resultContainer.removeChild(div);
        });

        // 后台返回时一个list, 返回结果有内容的时候.
        //
        //    现在的数据结构 { “Question-value” : “Answer-Value” }
        //    TODO:
        //     改造成 { "Question": Value,   "Answer": Value, "Flag": Value, "Comments":Vaule }
        //
        if (data.length !== 0) {

          console.log('POST 请求成功', data);

          // 后台返回时一个list
          data.forEach(function (item) {

            // 创建一个包含图片的 <img> 元素
            var q_img = document.createElement("img");
            q_img.src = "/static/rfx_server/asset/yellow-question-icon.png"; // 替换为你的图片路径
            q_img.alt = "Image";

            var a_img = document.createElement("img");
            a_img.src = "/static/rfx_server/asset/Green-answer-icon.png"; // 替换为你的图片路径
            a_img.alt = "Image";

            a_img.style.width = "30px"; // 设置宽度
            q_img.style.width = "30px"; // 设置宽度
            a_img.style.height = "30px"; // 设置高度
            q_img.style.height = "30px"; // 设置高度

            // 创建一个包含问题和答案的 <div> 元素
            var q_paragraph = document.createElement("div");
            var a_paragraph = document.createElement("div");



            //paragraph.textContent = item;
            for (var key in item) {
              var value = item[key];
              // 创建包含关键字高亮显示的 <span> 元素
              var q_highlighted = document.createElement("span");
              q_highlighted.innerHTML = key.replace(new RegExp(selectedText, "gi"), '<span class="highlight">$&</span>');

              var a_highlighted = document.createElement("span");
              a_highlighted.innerHTML = value.replace(new RegExp(selectedText, "gi"), '<span class="highlight">$&</span>');

              // 将高亮显示的 <span> 元素添加到 <div> 中
              q_paragraph.appendChild(q_img);
              a_paragraph.appendChild(a_img);

              q_paragraph.appendChild(q_highlighted);
              a_paragraph.appendChild(a_highlighted);


              // 添加类名
              q_paragraph.classList.add("card-q", "added-div");
              a_paragraph.classList.add("card-a", "added-div");
            }

            // 将 <p> 元素添加到容器中
            resultContainer.appendChild(q_paragraph);
            resultContainer.appendChild(a_paragraph);
          });
          // document.getElementById('answer-text').innerText = data;
        }

        // 这段是 当ES返回结果为空的时候的处理.
        else {
                console.log('POST 成功ですが、結果がありません！');

                var nothing_img = document.createElement("img");
                nothing_img.src = "/static/rfx_server/asset/Nothing.png"; 
                nothing_img.alt = "Image";
                nothing_img.classList.add("shaking-img")

                // nothing_img.style.width = "35px"; // 设置宽度
                // nothing_img.style.height = "35px"; // 设置高度
                nothing_img.style.alignItems = "center"


                // 创建一个包含问题和答案的 <div> 元素
                var nothing_area = document.createElement("div");
                var nothing_area_context = document.createElement("div");
              
                nothing_area.appendChild(nothing_img);
                nothing_area.classList.add( "added-div","center-parent-div");
                
                nothing_area_context.classList.add( "added-div");
                nothing_area_context.innerText = "[ "+ selectedText+ " ] " +"に関連レコードがありません、別のKeywordで検索してみましょう";
                nothing_area_context.style.textAlign = "center"
                nothing_area_context.style.margin = "12px"
                nothing_area_context.style.color = "gray"

                resultContainer.appendChild(nothing_area);
                resultContainer.appendChild(nothing_area_context);
                
                nothing_img.classList.add('shake-once');
                nothing_img.addEventListener('animationend', function() {
                imgElement.classList.remove('shake-once');
          });

        }
      },
      error: function (error) {
        console.error('POST 请求失败', error);
      }
    });
  }
  else {
    selectedCard.classList.remove('show');
  }
});


// The initialize function must be run each time a new page is loaded
Office.initialize = () => {
  document.getElementById('sideload-msg').style.display = 'none';
  document.getElementById('app-body').style.display = 'flex';
  document.getElementById("getCellData").onclick = showSelection;
};


//
// 调用 Office的 API 从 CELL 获取数据
//
async function showSelection() {
  Office.context.document.getSelectedDataAsync(
    "text",                        // coercionType
    {
      valueFormat: "unformatted",   // valueFormat
      filterType: "all"
    },            // filterType

    function (result) {            // callback
      const dataValue = result.value;
      
      questionFeild = document.getElementById('text')
      questionFeild.classList.add("expand");
      questionFeild.innerText = dataValue;

      // 每次获取 Cell中的内容的时候, 清除上次查询的结果
      selectedCard.classList.remove('show');
      console.log("Selected cell text: " + dataValue);
    });

}
