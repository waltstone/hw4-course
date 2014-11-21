var tmpl;
// get html template
$.get('thumbnail.html', function(data){
  tmpl = data;
});

var $listRoot = $('.page-list');


// 設定 Facebook AppID
window.fbAsyncInit = function() {
    FB.init({
        appId: '1516309875286299', // 若可以，請換成自己的 App ID !
        xfbml: true,
        version: 'v2.2'
    });

    $('#startBtn').click(function(e){
      //清空結果
      $($listRoot).empty();
      $('#moreBtn').addClass('hide');
      FB.login(function(response) {
        if(response.authResponse) {
            //讀取個人信息
            FB.api('/me?fields=name,picture,likes.limit(60)', function(response){
              $('.user-name').text(response.name);
              $('.user-photo').attr('src',response.picture.data.url);
              $('#user').removeClass('hide');
              var likes = response.likes.data;
              var next = response.likes.paging.next;
              loadPagesInfo(likes);
              // save next request url
              $('#moreBtn').removeClass('hide').data('next',next);
            });
        }else{
            console.log('User cancelled login or did not fully authorize.');
        }
      }, {scope: 'user_likes'});
      e.preventDefault();
    });

    $('#moreBtn').click(function(e){
      $.getJSON( $(this).data('next'), function(response){
        loadPagesInfo(response.data);
        var next = response.paging.next;
        $('#moreBtn').data('next',next);
      })
      e.preventDefault();
    });
};



// load each pages info and insert to html
var loadPagesInfo = function(pages){

  var counter = 0, //計算現在讀完資料沒
      current = $('<div class="current"></div>').appendTo($listRoot); //定位當前的

  pages.forEach(function(item, index){
    //從 template 塞資料
    var $page = $(tmpl).clone();
    FB.api(item.id, function(response){
      $page.find('.title a').attr('src', response.link).text(response.name);
      $page.find('.likes').text(response.likes);
      $page.find('.about').text(response.about);
      FB.api(response.id+'/picture?type=large', function(response){
        $page.find('img').attr('src',response.data.url);
        $page.appendTo(current);
        counter++;

        // 塞完資料以後處理一下斷行
        if(counter===pages.length){
          $( '.current div:nth-child(3n)').after('<div class="clearfix"></div>');
          current.children('div').unwrap();
        }
      });
    });
  });
};

