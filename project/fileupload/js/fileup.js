(function(){
	var input = $('<input type="file" accept="image/jpg,image/jpeg,image/png,image/gif" style="display:none;"></input>'),
		curElem = null;
		pro = $($('#pro').html());

	function fileUpload(file) {

		var uri = "/fileup";
        var xhr = new XMLHttpRequest();
        var fd = new FormData();
        curElem.append(pro);
        
        xhr.open("POST", uri, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // alert(xhr.responseText);
            }
        };
        xhr.upload.addEventListener("progress", function(e) {
                if (e.lengthComputable) {
                  var percentage = Math.round((e.loaded * 100) / e.total);
                  pro.find('.inner').css('width',percentage+'%');
                }
              }, false);
        xhr.upload.addEventListener("load", function(e) {
               pro.remove();
              }, false);
        pro.on('click',function(e){
        	e.stopPropagation();
        });
        fd.append('myFile', file);
        xhr.send(fd);
	}

	function fileSelect(elem) {
		curElem = elem;
		input[0].click();
	}

	function addElem(elem) {
		elem.on('click',function(e){
			fileSelect($(this));
		});
		elem.on('dragenter',function(e){
			e.stopPropagation();
			e.preventDefault();
		});
		elem.on('dragover',function(e){
			e.stopPropagation();
			e.preventDefault();
		});
		elem.on('drop',function(e){
			e.stopPropagation();
			e.preventDefault();
			curElem = $(this);
			var file = e.dataTransfer.files[0];
			filePreview(file);
			fileUpload(file);
		})
	}

	function filePreview(file) {
		var imageType = /^image\//;
	    if (!imageType.test(file.type)) {
	      return;
		}
		curElem.html('');
		var img = $('<img />');
		curElem.append(img);
        var reader = new FileReader();
        reader.addEventListener("load", function () {
           img[0].src = reader.result;
         }, false);

         if (file) {
           reader.readAsDataURL(file);
         }
	}
	
	function init() {
		$(document.body).append(input);
		input.on('change',function(e){
			var file = this.files[0];
			filePreview(file);
			fileUpload(file);
			this.value = '';
		});
	}


	window.fileup = {
		init:init,
		addElem:addElem
	}
})();
