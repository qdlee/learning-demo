function upload() {
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
}