/**
 * Created by Administrator on 2018/2/5.
 */
(function(mui, doc) {
    mui.init();
    mui.plusReady(function(){});
    var newflag = 0;//0Ϊ���ɼ� 1Ϊ�ɼ�
    mui(".mui-content").on('tap','#newsee',function(){
        if(newflag === 0){
            newflag = 1;
            $('#newsee').addClass('mui-active');
            $('#newsee').addClass('icon-xianshi');
            $('#newsee').removeClass('icon-buxianshi');
            $('#newpassword').attr('type','text');
        }else{
            newflag = 0;
            $('#newsee').removeClass('mui-active');
            $('#newsee').removeClass('icon-xianshi');
            $('#newsee').addClass('icon-buxianshi');
            $('#newpassword').attr('type','password');
        }
    });
    mui(".mui-content").on('tap','#success',function(){
        mui.openWindow({
            url:'changePay.html',
            id:'changePay',
            extras:{}
        });

       /* var btn = ["ȡ��","ȷ��"];
        mui.confirm('ȷ�����ã�','��ܰ��ʾ',btn,function(e) {
            if (e.index == 1) {
                var codeNumber = $('#newpassword').val();
                if(codeNumber != ''){
                    var rule = /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z]{6,}$/;
                    if(!rule.test(codeNumber)){
                        mui.alert('��������ĸ��������ϣ�����6λ��ɣ����ִ�Сд��','��ʾ','ȷ��',null,'div');
                    }else{
                        mui.ajax(config.httpPath+'api/sysUser/setPassword', {
                            data: {
                                id:localStorage.getItem('forgetphoneNum'),
                                passWord:codeNumber
                            },
                            dataType: 'json', //����������json��ʽ����
                            type: 'post', //HTTP��������
                            timeout: 10000, //��ʱʱ������Ϊ10�룻
                            beforeSend: function(request) {
                                request.setRequestHeader("X-Token",localStorage.getItem('token'));
                            },
                            success: function(ajaxData) {
                                //������������Ӧ��������Ӧ����������Ƿ�ɹ���
                                //alert(JSON.stringify(ajaxData));
                                if(ajaxData.meta.success==true){
                                    mui.toast(ajaxData.meta.message);
                                    mui.openWindow({
                                        url:'changePay.html',
                                        id:'changePay',
                                        extras:{}
                                    });
                                }else{
                                    mui.toast(ajaxData.meta.message);
                                }
                            },
                            error: function(xhr, type, errorThrown) {
                                //�쳣����
                                console.log(type);
                                mui.toast('�����쳣�����Ժ�����');
                            }
                        });
                    }
                }else{
                    //mui.alert('���벻��Ϊ��');
                    mui.alert('���벻��Ϊ��','��ʾ','ȷ��',null,'div');
                }
            }
        });*/
    });
}(mui, document));