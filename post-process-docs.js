console.log("Adding .nojekyll for GitHub Pages.")

require('create-file')(`${__dirname}/docs/.nojekyll`, '', error => {
  if(error) {
    process.exit(error)
  } else {
    process.exit(0)
  }
})
