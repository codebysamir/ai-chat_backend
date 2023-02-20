const fileExistsChecker = (req, res, next) => {
    if (!req.files) return res.status(400).json({
        status: 'error', message: 'No files selected'
    })

    next()
}

module.exports = fileExistsChecker