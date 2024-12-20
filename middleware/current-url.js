app.use((req, res, next) => {
  res.locals.currentUrl = req.url;
  next();
});
