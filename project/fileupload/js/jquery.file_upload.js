(function($) {
    var input = $('<input multiple type="file" style="display:none;"></input>');
    var opts = {};
    var curElem = {};
    var pcover = $('<div class="cover"></div>');

    function init() {
		$(document.body).append(input);
		input.on('change',function(e){
			var file = this.files[0];
            curElem.append(pcover);
			imagePreview(file);
			// fileUpload(file);
			this.value = '';
		});
	}

    function fileUpload(file) {

		var uri = opts.url;
        var xhr = new XMLHttpRequest();
        var fd = new FormData();

        xhr.open("POST", uri, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                opts.success(xhr);
            }
        };
        xhr.upload.addEventListener("progress", function(e) {
                opts.upProgress(e);
        }, false);
        xhr.upload.addEventListener("load", function(e) {
            opts.upProgressSuccess(e);
        }, false);

        xhr.upload.addEventListener("error", function(e) {
            opts.upProgressError(e);
        }, false);

        fd.append(opts.fileName, file);
        xhr.send(fd);
	}

	function fileSelect(elem) {
		curElem = elem;
		input[0].click();
	}

	function addElem(elem,options) {
        if(opts.multiple){
            if(!options.triggerEle){
                elem.append(opts.triggerEle);
            }
            opts.triggerEle.on('click',function(e){
    			fileSelect(elem);
    		})
        }else{
            elem.on('click',function(e){
                fileSelect(elem);
            });
        }
		elem.on('dragenter',function(e){
			e.stopPropagation();
			e.preventDefault();
		});
		elem.on('dragover',function(e){
			e.stopPropagation();
			e.preventDefault();
		});
		elem.on('drop',function(e){
            e = e.originalEvent;
			e.stopPropagation();
			e.preventDefault();
			curElem = $(this);
			var file = e.dataTransfer.files[0];
			filePreview(file);
			// fileUpload(file);
		})
	}

	function imagePreview(file) {
		var imageType = /^image\//;
	    if (!imageType.test(file.type)) {
	      return;
		}

        var img = $('<img width="100%" height="100%" />');
        if(opts.multiple){
            opts.imgCon.clone().append(img).prependTo(curElem);
        }else{
            curElem.html('').append(img);
        }

        var reader = new FileReader();
        reader.addEventListener("load", function () {
           img[0].src = reader.result;
         }, false);

         if (file) {
           reader.readAsDataURL(file);
         }
	}

    $.fn.fileUpload = function (options) {
        opts = $.extend($.fn.fileUpload.defaults,options);
        if(opts.url.indexOf('/')===-1){
            throw new Error('上传地址未设置！！');
        }
        addElem(this,options);
        init();
    };

    $.fn.fileUpload.defaults = {
        fileName:'image',
        multiple:false,
        imgCon:$('<p></p>'),
        triggerEle:$('<button>点击添加文件</button>'),
        success:function (xhr) {
            alert(xhr.responseText);
        },
        upProgress:function (e) {
            if (e.lengthComputable) {
              var percentage = 100-Math.round((e.loaded * 100) / e.total);
              pcover.css('height',percentage+'%');
              console.log(percentage+'%');
            }
        },
        upProgressSuccess:function (e) {
            console.log('上传成功');
        },
        upProgressError:function (e) {
            console.log('上传失败');
        }
    };

}(jQuery));
