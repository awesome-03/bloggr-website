// TODO: Fix the scrolling of the page, when typing on a line.
const $textarea = $("#create-blog-content");

$textarea.on("input", function () {
  // Auto-resize the textarea
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";

  // Check if the footer is out of view
  const footer = document.querySelector("footer");
  const footerRect = footer.getBoundingClientRect();

  if (footerRect.bottom > window.innerHeight) {
    // Footer is below the visible viewport, so scroll to bottom of page
    window.scrollTo(0, document.body.scrollHeight);
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    });
  }
});

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
        "border": "none",
        "color": "inherit",
        "background-color": "transparent",
      });

      $dropArea.find("div > img, div > h3").hide();

      $headerContent.css("background", "linear-gradient(to top, rgba(0, 0, 0, 1), transparent)");
      $contentSection.css("border-top", "none");
    };

    reader.readAsDataURL(file);
  }

  // Drag & Drop
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

  // Click-to-upload
  $fileInput.on("change", function () {
    const file = this.files[0];
    handleImageUpload(file);
  });
});

$('#create-blog-form').on('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  const title = formData.get('title');
  const urlSlug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

  formData.append('slug', urlSlug);

  const response = await fetch('/blogs/create', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    window.location.href = `/blogs/${urlSlug}`;
  } else {
    alert('Error creating blog post');
  }
});


// $(function () {
//   const $dropArea = $(".drop-image");
//   const $headerContent = $(".create-blog-header-content");
//   const $contentSection = $(".read-blog-content");

//   // Highlight the drop area when dragging over anywhere on the page
//   $(document).on("dragenter dragover", function (e) {
//     e.preventDefault();
//     e.stopPropagation();
//     $dropArea.addClass("dragover");
//   });

//   $(document).on("dragleave dragend drop", function (e) {
//     e.preventDefault();
//     e.stopPropagation();
//     $dropArea.removeClass("dragover");
//   });

//   // Handle drop anywhere on the page
//   $(document).on("drop", function (e) {
//     e.preventDefault();
//     e.stopPropagation();

//     const files = e.originalEvent.dataTransfer.files;
//     if (files.length === 0) return;

//     const file = files[0];
//     if (!file.type.startsWith("image/")) {
//       alert("Please drop an image file.");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = function (event) {
//       // Set dropped image as background
//       $dropArea.css({
//         "background-image": `url(${event.target.result})`,
//         "background-size": "cover",
//         "background-position": "center",
//         "background-repeat": "no-repeat",
//         "border": "none",
//         "color": "inherit",
//         "background-color": "transparent",
//       });

//       // Hide drop prompt elements
//       $dropArea.find("div > img, div > h3").hide();

//       // Revert custom styles by clearing inline overrides
//       $headerContent.css("background", "linear-gradient(to top, rgba(0, 0, 0, 1), transparent)");
//       $contentSection.css("border-top", "none");
//     };

//     reader.readAsDataURL(file);
//   });
// });
