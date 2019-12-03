//Materialize Inits
$(document).ready(function() {
  $(".modal").modal();
  $(".chips").chips();
});

//Page preloader
document.addEventListener("DOMContentLoaded", function() {
  $(".preloader-background")
    .delay(1000)
    .fadeOut("slow");

  $(".preloader-wrapper")
    .delay(1000)
    .fadeOut();
});

//AJAX File handler
$(document).ready(function(e) {
  $("#uploadForm").on("submit", function(e) {
    e.preventDefault();
    var data = new FormData(this);
    data.delete("tags");
    var chipData = M.Chips.getInstance($("#tags")).chipsData;
    var tags = [];
    chipData.forEach(element => {
      tags.push(element.tag);
    });
    data.append("tags", tags);
    $.ajax({
      url: "/uploadFile",
      type: "POST",
      data: data,
      contentType: false,
      cache: false,
      processData: false,
      success: function(response) {
        if (response.status == "success") {
          M.toast({
            html: "File uploaded!",
            displayLength: 1000,
            classes: "green rounded",
            completeCallback: function() {
              window.location.reload();
            }
          });
        } else {
          M.toast({
            html: "Upload Failed!",
            displayLength: 1000,
            classes: "red rounded",
            completeCallback: function() {
              window.location.reload();
            }
          });
        }
        var instance = M.Modal.getInstance(
          document.getElementById("uploadModal")
        );
        instance.close();
      }
    });
  });
});
