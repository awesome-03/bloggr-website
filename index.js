import express from "express";
import multer from "multer";

const app = express();
const PORT = 3000;

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

app.use(express.static("public"));

/*
  / -> The landing/home page.
  /blogs -> The page for discovering existing blogs.
  /blogs/create -> The page for creating and publishing blogs.
  /blogs/[blog-title-here] -> The page for reading a blog.
*/

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/blogs", (req, res) => {
  res.render("discover.ejs", {
    blogs: blogs,
  });
});

app.get("/blogs/create", (req, res) => {
  res.render("create-blog.ejs", {
    views: "0",
    date: getFormattedDate(),
    userName: "awesome03",
  });
});

app.get("/blogs/:slug", (req, res) => {
  const { slug } = req.params;
  const blog = blogs[slug];

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  // FIXME: Blogs start at 2 views after creation.
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

app.post("/blogs/create", upload.single("image"), (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).send("Missing title or content");
    }

    // Convert title to url.
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (blogs[slug]) {
      return res.status(409).send("Blog with this title already exists.");
    }

    blogs[slug] = {
      title,
      content,
      slug,
      imagePath: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: getFormattedDate(),
      views: 0,
    };

    res.redirect(`/blogs/${slug}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  } // Do I even need this error?
});

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
