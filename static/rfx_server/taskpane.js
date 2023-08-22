// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

let canClick = true;

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


function delete_record(id)
{
  console.log("Delete record: ", id)

  var divElement = document.getElementById(id);
  var parentDiv = divElement.parentNode;
  var check_bar_toremove = document.getElementById(id+"_check_bar");
  //check_bar_toremove.innerHTML = "";
  var token = getCookie('csrftoken');

  $.ajax({
    url: "DeleteItem",
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ id: id }),
    headers: {
      'X-CSRFToken': token // 替换为你的CSRF令牌值
    },

    success: function (data) {}
  });


  check_bar_toremove.classList.add("fade-out");
  check_bar_toremove.innerText = "Deleted OK";

  divElement.classList.add("slide-out");

  console.log("this record will be deleled: ", id);
  setTimeout(function() {
      divElement.removeChild(check_bar_toremove);
  }, 1000); // 等待 1 秒后执行移除操作

  setTimeout(function() {
    parentDiv.removeChild(divElement);
}, 1000); // 等待 1 秒后执行移除操作
}


function confirm_delete_item(id) {
      var box = document.getElementById(id);
      var question = document.getElementById(id+"_question");
      console.log(id);
 
      var delete_check_bar = document.createElement("div");
      delete_check_bar.id = id+"_check_bar";
      var info = document.createElement("div");

      var check = document.createElement("div");
      check.classList.add("question_bar");
      var yes = document.createElement("div");
      var no = document.createElement("div");
      

      info.classList.add("vertical-container", "card-del");
      info.innerText = "この記録を削除しますか？"

      yes.classList.add("yes_icon");
      no.classList.add("no_icon");

      yes.innerText = "YES";
      no.innerText = "NO";



      check.appendChild(yes);
      check.appendChild(no);
      info.appendChild(check);
      delete_check_bar.appendChild(info);

      box.insertBefore(delete_check_bar, question);

      yes.onclick = function(){
        delete_record(id);
        canClick = true;
      }

      no.onclick = function(){
        box.removeChild(delete_check_bar)
        canClick = true;
      }
}

//
// 创建一个 控制栏, 包含 rate, 删除 按钮
// 添加到 父id的div后面
//
function question_ctrl_bar(parent_id)
{
  console.log(parent_id);
  var ctrl_bar = document.createElement("div");
  ctrl_bar.classList.add("vertical-container");
  var ctrl_bar_sub = document.createElement("div");
  ctrl_bar_sub.classList.add("question_bar");
  ctrl_bar.id = parent_id+"_crtl_bar";

// for Rate icon
  var Good_img = document.createElement("img");
  Good_img.src = "/static/rfx_server/asset/Good.png"; 
  Good_img.alt = "Image";
  Good_img.style.marginRight = "60px";
  Good_img.classList.add("icon_style");

// for Delete icon
  var drop_img = document.createElement("img");
  drop_img.src = "/static/rfx_server/asset/Delete-init.png"; 
  drop_img.alt = "Image";
  drop_img.style.marginLeft ="60px";
  drop_img.id = parent_id+"ctrl_delete";
  drop_img.classList.add("icon_style");
  drop_img.onclick = function() {
    if(canClick){
      canClick = false;
      confirm_delete_item(parent_id);
    }
  }

  ctrl_bar_sub.appendChild(Good_img);
  ctrl_bar_sub.appendChild(drop_img);
  ctrl_bar.appendChild(ctrl_bar_sub);

  return ctrl_bar;
}

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}


function create_copy_button(id, text)
{
      //Answer bar
      var copy_button = document.createElement("div");
      
      copy_button.classList.add("question_bar");

      var copy_icon = document.createElement("div");
      copy_icon.onclick = function()
      {
        copyToClipboard(text);
        copy_icon.innerText = "COPIED";
        console.log('文本已复制到剪贴板');


      }
      copy_icon.classList.add("copy_icon");
      copy_icon.innerText = "COPY";
      copy_icon.id = id+"_copy_button";
      copy_button.appendChild(copy_icon);

      return copy_button;
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
          data.forEach(function (item, index) {

            doc_id = item.id;
            question = item.Question;
            answer = item.Answer;
            flag = item.Flag;
            comment = item.Comment;
            console.log("Doc id:", doc_id);
            

            var box = document.createElement("div");
            box.id = doc_id;
            box.classList.add("card", "added-div");
            box.appendChild(question_ctrl_bar(box.id));

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



            if (!answer) {
              // 如果回答中 没有answer ,但是包含了一个 flag的话, 也显示一下吧.
              if (flag){

                var q_paragraph = document.createElement("div");
                q_paragraph.id = "question_flag_list"+index;
                var f_paragraph = document.createElement("div"); 

                var q_highlighted = document.createElement("span");
                q_highlighted.innerHTML = question.replace(new RegExp(selectedText, "gi"), '<span class="highlight">$&</span>');                
                f_paragraph.innerHTML = flag;

                q_paragraph.classList.add("card-q");
                f_paragraph.classList.add("card-a");

                q_paragraph.appendChild(q_img);
                q_paragraph.appendChild(q_highlighted);
                //q_paragraph.appendChild(question_ctrl_bar(q_paragraph.id));

                box.appendChild(q_paragraph);
                box.appendChild(f_paragraph);

                resultContainer.appendChild(box);
                
              }
              return;
            }
            
            // 创建一个包含问题和答案的 <div> 元素
            var q_paragraph = document.createElement("div");
            var a_paragraph = document.createElement("div");
            q_paragraph.id = box.id+"_question";
            a_paragraph.id = box.id+"_answer";

            var q_highlighted = document.createElement("span");
            q_highlighted.innerHTML = question.replace(new RegExp(selectedText, "gi"), '<span class="highlight">$&</span>');

            var a_highlighted = document.createElement("span");
            a_highlighted.innerHTML = answer.replace(new RegExp(selectedText, "gi"), '<span class="highlight">$&</span>');

            // 将高亮显示的 <span> 元素添加到 <div> 中
            q_paragraph.appendChild(q_img);
            a_paragraph.appendChild(a_img);
            q_paragraph.appendChild(q_highlighted);
            a_paragraph.appendChild(a_highlighted);        
            a_paragraph.appendChild(create_copy_button(a_paragraph.id, answer));


            // 添加类名
            q_paragraph.classList.add("card-q");
            a_paragraph.classList.add("card-a");

            box.appendChild(q_paragraph);
            box.appendChild(a_paragraph);

            // 回答中带有comment 时候的显示
            if (comment) {
              var c_img = document.createElement("img");
              c_img.src = "/static/rfx_server/asset/comment_icon.png"; // 替换为你的图片路径
              c_img.alt = "Image";
              c_img.style.height = "30px"; // 设置高度
              c_img.style.height = "30px"; // 设置高度


              var c_paragraph = document.createElement("div");
              c_paragraph.id = box.id+"_comment";
              var c_highlighted = document.createElement("span");
              c_highlighted.innerHTML = comment.replace(new RegExp(selectedText, "gi"), '<span class="highlight">$&</span>');
              c_paragraph.appendChild(c_img);
              c_paragraph.appendChild(c_highlighted);
              c_paragraph.appendChild(create_copy_button(c_paragraph.id, comment));
              c_paragraph.classList.add("card-a");
              box.appendChild(c_paragraph);
            }

            resultContainer.appendChild(box);


            // 添加 删除按钮的 动画
            const imageElement = document.getElementById(box.id+"ctrl_delete");

            imageElement.addEventListener('mouseover', function() {
              this.src = "/static/rfx_server/asset/Delete-enabled.png"; // 更换图像路径
            });
            imageElement.addEventListener('mouseout', function() {
              this.src = "/static/rfx_server/asset/Delete-init.png";// 鼠标移开时恢复默认图像
            }); 

          });

        }


        //--------------------------------------------------------------------------------
        // 这段是 当ES返回结果为空的时候的处理.
        //--------------------------------------------------------------------------------
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
          nothing_area.classList.add("added-div", "center-parent-div");

          nothing_area_context.classList.add("added-div");
          nothing_area_context.innerText = "[ " + selectedText + " ] " + "に関連レコードがありません、別のKeywordで検索してみましょう";
          nothing_area_context.style.textAlign = "center"
          nothing_area_context.style.margin = "12px"
          nothing_area_context.style.color = "gray"

          resultContainer.appendChild(nothing_area);
          resultContainer.appendChild(nothing_area_context);

          nothing_img.classList.add('shake-once');
          nothing_img.addEventListener('animationend', function () {
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

      questionFeild = document.getElementById('text');
      questionFeild.classList.add("expand");
      questionFeild.classList.remove("gary-text");
      questionFeild.innerText = dataValue;

      // 每次获取 Cell中的内容的时候, 清除上次查询的结果
      selectedCard.classList.remove('show');
      console.log("Selected cell is text: " + dataValue);
    });

}



