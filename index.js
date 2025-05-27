import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;

let pageViews = 0;

const upload = multer({
  dest: "public/uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

const blogs = {};

/*
  The routes for this project are going to be something like this:
  ----------------------------------------------------------------
  / -> The main page of the project where it explains the project details, such as what the user can do etc.
  /blogs -> Where the user can see choose a blog post to read/make/edit
  /blogs/create -> The page to create and publish blogs.
  /blogs/[blog-title-here] -> The page for reading/editing the blog. Here, there's an edit button to edit the text and save.
*/

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/blogs", (req, res) => {
  res.render("discover.ejs", {
    blogs: blogs,
  });
});

// app.get("/blogs/random-blog-title", (req, res) => {
//   pageViews++;
//   res.render("read-blog.ejs", {
//     views: pageViews,
//     date: getFormattedDate(),
//     userName: "awesome03",
//   });
// });

app.get("/blogs/create", (req, res) => {
  res.render("create-blog.ejs", {
    views: "0",
    date: getFormattedDate(),
    userName: "awesome03",
  });
});

// TEST CODE HERE:
// -----------------------------------------
app.get("/blogs/:slug", (req, res) => {
  const { slug } = req.params;
  const blog = blogs[slug];

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  blog.views++;
  res.render("read-blog.ejs", {
    views: blog.views,
    date: blog.createdAt,
    userName: "awesome03",
    title: blog.title,
    text: blog.content,
    image: blog.imagePath,
  });
});

app.post(
  "/blogs/create",
  upload.single("image"), // multer middleware for single file upload with field name "image"
  (req, res) => {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).send("Missing title or content");
      }

      // Create URL slug (lowercase, dashes, only alphanumeric)
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""); // remove trailing dash

      if (blogs[slug]) {
        return res.status(409).send("Blog with this title already exists.");
      }

      // Save the blog in memory (for demo)
      blogs[slug] = {
        title,
        content,
        slug,
        imagePath: req.file ? `/uploads/${req.file.filename}` : null,
        createdAt: getFormattedDate(),
        views: 0,
      };
      console.log(blogs);

      // Redirect to the blog's page
      res.redirect(`/blogs/${slug}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);
// -----------------------------------------

app.listen(PORT, () => {
  console.log("Listening to port " + PORT);
});

function getFormattedDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = String(today.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}
