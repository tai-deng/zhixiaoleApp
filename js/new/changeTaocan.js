/**
 * Created by Administrator on 2018/2/2.
 */
(function(mui, doc) {
    mui.init();
    var phone,password,securityCode;
    mui.plusReady(function() {
        //返回上级页面刷新
        var self=plus.webview.currentWebview();
        var opener = self.opener();
        var old_back = mui.back;
        mui.back = function() {
            var wobj = plus.webview.getWebviewById(opener.id);
            wobj.reload(true);
            old_back();
        };
    });
    var clickId = new Uri(location.href).getQueryParamValue('clickId');
    var packageId = new Uri(location.href).getQueryParamValue('packageId');
    var siteFcode,userId,oldSerId,newSerId;
    //获取页面的套餐信息
    getInformation();
    function getInformation(){
        mui.ajax(config.httpPath+'api/Broadband/prepayChangeSerSet', {
            data: {
                id:localStorage.getItem('id'),
                siteFcode:localStorage.getItem('siteFcode'),
                userId:localStorage.getItem('UserNum'),
                oldSerId:packageId,
                newSerId:clickId,
                type:'0'
            },
            dataType: 'json', //服务器返回json格式数据
            type: 'post', //HTTP请求类型
            timeout: 10000, //超时时间设置为10秒；
            beforeSend: function(request) {
                request.setRequestHeader("X-Token",localStorage.getItem('token'));
            },
            success: function(ajaxData) {
                //服务器返回响应,根据响应结果,分析是否成功；
                //alert(JSON.stringify(ajaxData));
                if(ajaxData.meta.success == true){
                    $('#userName').text(localStorage.getItem('UserNum'));
                    $('#taocan').text(ajaxData.data.oldSetSet.name);
                    $('#bizozhun').text(ajaxData.data.oldSetSet.amount+'元/周期');
                    var timestamp = Date.parse(new Date());
                    //alert(timestamp +'===='+ajaxData.data.oldSetSet.expireTime);
                    if(timestamp > ajaxData.data.oldSetSet.expireTime || ajaxData.data.oldSetSet.expireTime == '' || ajaxData.data.oldSetSet.expireTime == null){
                        $('#end_time').text('暂未生效');
                    }else{
                        $('#end_time').text(formatDateTime1(ajaxData.data.oldSetSet.expireTime/1000));
                    }
                    $('#taocanNew').text(ajaxData.data.newSetSet.name);
                    $('#bizozhunNew').text(ajaxData.data.newSetSet.amount+'元/周期');
                    if(ajaxData.data.isPrepare == true){
                        $('#yesTips').removeClass('display-none');
                        $('#noTips').addClass('display-none');
                        $('#taocanChange').text(ajaxData.data.prepareSetSet.name);
                        $('#bizozhunChange').text(ajaxData.data.prepareSetSet.amount+'元/周期');
                        $('#change_time').text(formatDateTime1(ajaxData.data.prepareSetSet.changeDate/1000));
                        $('#shengxiao_time').text(formatDateTime1(ajaxData.data.prepareSetSet.effectiveDate/1000));
                    }else{
                        $('#yesYuyue').addClass('display-none');
                    }
                }else{
                    mui.toast(ajaxData.meta.message);
                }
            },
            error: function(xhr, type, errorThrown) {
                //异常处理；
                console.log(type);
                mui.toast('网络异常,请稍后再试');
            }
        });
    }
    //根据不同学校显示不同的咨询地址
    var adress= localStorage.getItem('siteFcode');
    if(adress == '823ef78c7ed94e905156905798cbd175'){
        //长沙师范
        //长沙师范
        $('.schoolAdress').text('北校区阳光服务大厅；南校区南校门原招生就业处。');
    }else if(adress == 'fb9d10335b551d5a76d36df2bc961951'){
        //湘中幼师
        $('.schoolAdress').text('学生宿舍楼2栋101门面。');
    }else{
        //长沙师范
        $('.schoolAdress').text('北校区阳光服务大厅；南校区南校门原招生就业处。');
    }
    //点击下一步
    mui(".mui-content").on('tap','#next',function(){
        //alert(localStorage.getItem('siteType'));
        if(localStorage.getItem('siteType') == 1){
            mui.ajax(config.httpPath+'api/Broadband/changeSerSet', {
                data: {
                    id:localStorage.getItem('id'),
                    siteFcode:localStorage.getItem('siteFcode'),
                    userId:localStorage.getItem('UserNum'),
                    passWord: '',
                    newSerId:clickId
                },
                dataType: 'json', //服务器返回json格式数据
                type: 'post', //HTTP请求类型
                timeout: 10000, //超时时间设置为10秒；
                beforeSend: function(request) {
                    request.setRequestHeader("X-Token",localStorage.getItem('token'));
                },
                success: function(ajaxData) {
                    //服务器返回响应,根据响应结果,分析是否成功；
                    //alert(JSON.stringify(ajaxData));
                    if(ajaxData.meta.success == true){
                        var amount,name,userId,activeDate,resultCode,accountFee,taocanAmount;
                        resultCode = ajaxData.meta.resultCode;
                        name = ajaxData.data.name;
                        amount = ajaxData.data.amount;
                        userId = ajaxData.data.userId;
                        activeDate = ajaxData.data.activeDate;
                        accountFee = ajaxData.data.accountFee;
                        taocanAmount = ajaxData.data.serSetAmount;
                        var foreignId = ajaxData.data.foreignId;
                        /*mui.openWindow({
                            url:'../success.html?amount='+amount+'&&accountFee='+accountFee+'&&taocanAmount='+taocanAmount+'&&name='+name+'&&userId='+userId+'&&activeDate='+activeDate+'&&resultCode='+resultCode,
                            id:'success',
                            extras:{}
                        });*/
                        //直接支付
                        //var amount = $('#buyPrice').text();
                        var wxChannel = null; // 微信支付
                        var aliChannel = null; // 支付宝支付
                        var channel = null;   //支付通道
                        var orderId;
                        //获取订单Id
                        mui.ajax(config.httpPath+'api/Broadband/queryOrderId', {
                            data: {},
                            dataType: 'json', //服务器返回json格式数据
                            type: 'post' , //HTTP请求类型
                            timeout: 10000, //超时时间设置为10秒；
                            beforeSend: function(request) {
                                request.setRequestHeader("X-Token",localStorage.getItem('token'));
                            },
                            success: function(ajaxData) {
                                //服务器返回响应，根据响应结果，分析是否成功；
                                //alert(JSON.stringify(ajaxData));
                                if(ajaxData !== ''){
                                    //mui.toast(ajaxData.meta.message);
                                    orderId = ajaxData;
                                    if(mui.os.wechat){
                                        //alert(amount+'--'+userId+'--'+localStorage.getItem('id')+'---'+siteFcode+'--'+orderId);
                                        mui.ajax(config.httpPath+'api/Broadband/toPay_wx', {
                                            data: {
                                                amount:amount,
                                                userId:userId,
                                                id:localStorage.getItem('id'),
                                                siteCode:localStorage.getItem('siteFcode'),
                                                orderId:orderId,
                                                foreignId: foreignId,
                                                foreignType:'1'
                                            },
                                            dataType: 'json', //服务器返回json格式数据
                                            type: 'post', //HTTP请求类型
                                            timeout: 10000, //超时时间设置为10秒；
                                            beforeSend: function(request) {
                                                request.setRequestHeader("X-Token",localStorage.getItem('token'));
                                            },
                                            success: function(ajaxData) {
                                                //服务器返回响应，根据响应结果，分析是否成功；
                                                //alert(JSON.stringify(ajaxData));
                                                if(ajaxData !== '' && ajaxData !== 'null'){
                                                    //mui.toast(ajaxData.meta.message);
                                                    mui.openWindow({
                                                        url:ajaxData.data,
                                                        id:ajaxData.data,
                                                        extras:{}
                                                    });
                                                }else{
                                                    //mui.toast(ajaxData.meta.message);
                                                    mui.alert('<a class="maincolor">支付请求不成功，请重试</a>','提示','知道了',null,'div');
                                                }
                                            },
                                            error: function(xhr, type, errorThrown) {
                                                //异常处理；
                                                console.log(type);
                                                mui.toast('网络异常，请稍后再试');
                                            }
                                        });
                                    }else{
                                        startWXPAY();
                                    }
                                }else{
                                    //mui.toast(ajaxData.meta.message);
                                    mui.alert('<a class="maincolor">支付请求不成功，请重试</a>','提示','知道了',null,'div');
                                }
                            },
                            error: function(xhr, type, errorThrown) {
                                //异常处理；
                                console.log(type);
                                mui.toast('网络异常，请稍后再试');
                            }
                        });
                        //startWXPAY();
                        function startWXPAY()
                        {
                            //调用pay()方法 发起支付即可
                            pay();
                            //定义支付通道
                            var channel = null;
                            //获取支付通道
                            getChannels();
                            //获取支付通道的方法
                            function getChannels() {
                                if(window.plus){
                                    plus.payment.getChannels(function(channels) {
                                        for (var i = 0; i < channels.length; i++) {
                                            if (channels[i].id == "wxpay") {
                                                channel = channels[i];
                                                plus.ui.toast("等待微信支付中");
                                            }
                                        }
                                    }, function(e) {
                                        plus.ui.toast("获取支付通道失败!");
                                        //console.log("获取支付通道失败!");
                                    });
                                }else{
                                    mui.toast('需手机APP才能支付');
                                    /*document.addEventListener( "plusready", plusReady, false );
                                     plusReady();*/
                                }
                            }
                            //发起微信支付请求的方法
                            function pay() {
                                //获取微信支付参数的url
                                //alert(amount+'--'+userId+'--'+localStorage.getItem('id')+'--'+siteFcode+'--'+orderId+"----"+client);
                                mui.ajax(config.httpPath+'api/Broadband/toPay', {
                                    data: {
                                        amount:amount,
                                        userId:userId,
                                        id:localStorage.getItem('id'),
                                        siteCode:localStorage.getItem('siteFcode'),
                                        orderId:orderId,
                                        foreignId: foreignId,
                                        foreignType:'1'
                                    },
                                    dataType: 'json', //服务器返回json格式数据
                                    type: 'post', //HTTP请求类型
                                    timeout: 10000, //超时时间设置为10秒；
                                    beforeSend: function(request) {
                                        request.setRequestHeader("X-Token",localStorage.getItem('token'));
                                    },
                                    success: ajax_success_callback,
                                    error: ajax_error_callback
                                });
                                //获取微信支付参数成功的回调函数
                                function ajax_success_callback(resObj) {
                                    //alert(JSON.stringify(resObj));
                                    if (window.plus){
                                        var res_str = JSON.stringify(resObj);
                                        //用返回参数 发起微信支付请求
                                        //alert('1212'+res_str);
                                        plus.payment.request(channel, res_str, wxpay_success, wxpay_error);
                                    }else{
                                        if(mui.os.ios){

                                        }
                                        mui.toast('需手机APP才能支付，ajax');
                                        //document.addEventListener( "plusready", plusReady, false );

                                    }
                                }
                                //获取微信支付参数失败的回调函数
                                function ajax_error_callback(e) {
                                    plus.ui.alert("ajax获取参数失败");
                                }
                                //微信支付成功回调
                                function wxpay_success(result) {
                                    var timestamp=new Date().getTime();
//            window.location.href = location.origin+"/order/payFinish/"+${order.id}+"?timestamp="+timestamp;
//                                    window.location.href = location.origin+'/mobileApp/html-kuanDaiPay/payList.html?timestamp='+timestamp+'&&orderId='+orderId;
                                    mui.openWindow({
                                        url:location.origin+'/mobileApp/html-kuanDaiPay/payList.html?timestamp='+timestamp+'&&orderId='+orderId,
                                        id:'payList.html',
                                        extras:{}
                                    });
                                }
                                //微信支付失败回调
                                function wxpay_error(error) {
                                    plus.ui.alert("支付失败!");
                                }
                            }
                        }
                        return false;
                    }else{
                        //mui.toast();
                        mui.alert(ajaxData.meta.message,'温馨提示','知道了',null,'div');
                    }
                },
                error: function(xhr, type, errorThrown) {
                    //异常处理；
                    console.log(type);
                    mui.toast('网络异常,请稍后再试');
                }
            });
        }else{
            var btnArray = ['取消', '确定'];
            mui.prompt('请输入您的宽带登录密码：<br/><br/>1、密码默认为身份证后六位（X小写），错误请前往营业厅找回。', '', '<span class="iconfont icon-gth maincolor font22"></span>', btnArray, function(e) {
                if (e.index == 1) {
                    //alert(e.value);
                    if(e.value != '' && e.value != undefined){
                        mui.ajax(config.httpPath+'api/Broadband/changeSerSet', {
                            data: {
                                id:localStorage.getItem('id'),
                                siteFcode:localStorage.getItem('siteFcode'),
                                userId:localStorage.getItem('UserNum'),
                                passWord: e.value,
                                newSerId:clickId
                            },
                            dataType: 'json', //服务器返回json格式数据
                            type: 'post', //HTTP请求类型
                            timeout: 10000, //超时时间设置为10秒；
                            beforeSend: function(request) {
                                request.setRequestHeader("X-Token",localStorage.getItem('token'));
                            },
                            success: function(ajaxData) {
                                //服务器返回响应,根据响应结果,分析是否成功；
                                //alert(JSON.stringify(ajaxData));
                                if(ajaxData.meta.success == true){
                                    var amount,name,userId,activeDate,resultCode,accountFee,taocanAmount;
                                    resultCode = ajaxData.meta.resultCode;
                                    name = ajaxData.data.name;
                                    amount = ajaxData.data.amount;
                                    userId = ajaxData.data.userId;
                                    activeDate = ajaxData.data.activeDate;
                                    accountFee = ajaxData.data.accountFee;
                                    taocanAmount = ajaxData.data.serSetAmount;
                                    mui.openWindow({
                                        url:'../success.html?amount='+amount+'&&accountFee='+accountFee+'&&taocanAmount='+taocanAmount+'&&name='+name+'&&userId='+userId+'&&activeDate='+activeDate+'&&resultCode='+resultCode,
                                        id:'success'+"&&?time="+new Date().getTime(),
                                        extras:{}
                                    });
                                }else{
                                    //mui.toast(ajaxData.meta.message);
                                    mui.alert('宽带登录密码错误','温馨提示','知道了',null,'div');
                                }
                            },
                            error: function(xhr, type, errorThrown) {
                                //异常处理；
                                console.log(type);
                                mui.toast('网络异常,请稍后再试');
                            }
                        });
                    }else{
                        mui.alert('请输入您的宽带登录密码再尝试提交','提示','知道了',null,'div');
                    }
                    /*mui.openWindow({
                     url:'../welcome.html',
                     id:'welcome',
                     extras:{}
                     });*/
                } else {}
            },'div');
        }
    });
}(mui, document));

