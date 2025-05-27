// FIXME: The page scrolls to the top when you type on an existing line.
/*
  Expected Scrolling Behavior:
    Scroll When: 
      - A new line gets created at the end of the field.
      - The very bottom line overflows to a new line.
      - The line at the bottom of the users view overflows to a new line.
    Don't Scroll When:
      - The user starts typing on an existing line (that is in view).
*/

const $textarea = $("#create-blog-content");

$textarea.on("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";

  const footer = document.querySelector("footer");
  const footerRect = footer.getBoundingClientRect();

  if (footerRect.bottom > window.innerHeight) {
    window.scrollTo(0, document.body.scrollHeight);
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    });
  }
});

// -------------------------------------------------------

$(function () {
  const $dropArea = $(".drop-image");
  const $headerContent = $(".create-blog-header-content");
  const $contentSection = $(".read-blog-content");
  const $fileInput = $("#image-upload");

  function handleImageUpload(file) {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      $dropArea.css({
        "background-image": `url(${event.target.result})`,
        "background-size": "cover",
        "background-position": "center",
        "background-repeat": "no-repeat",
        border: "none",
        color: "inherit",
        "background-color": "transparent",
      });

      $dropArea.find("div > img, div > h3").hide();

      $headerContent.css(
        "background",
        "linear-gradient(to top, rgba(0, 0, 0, 1), transparent)"
      );
      $contentSection.css("border-top", "none");
    };

    reader.readAsDataURL(file);
  }

  $(document).on("dragenter dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    $dropArea.addClass("dragover");
  });

  $(document).on("dragleave dragend drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    $dropArea.removeClass("dragover");
  });

  $(document).on("drop", function (e) {
    const files = e.originalEvent.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  });

  $fileInput.on("change", function () {
    const file = this.files[0];
    handleImageUpload(file);
  });
});

$("#create-blog-form").on("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  const title = formData.get("title");
  const urlSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-");

  formData.append("slug", urlSlug);

  const response = await fetch("/blogs/create", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    window.location.href = `/blogs/${urlSlug}`;
  } else {
    alert("Error creating blog post");
  }
});
