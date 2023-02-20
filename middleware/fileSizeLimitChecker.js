const MB = 4 // 4 MB
const FILE_SIZE_LIMIT = MB * 1024 * 1024

const fileSizeLimitChecker = (req, res, next) => {
    const files = req.files
    const filesToBigArray = []

    Object.keys(files).forEach(key => {
        if (files[key].size > FILE_SIZE_LIMIT) {
            filesToBigArray.push(files[key].name)
        }
    })

    if (filesToBigArray.length) {
         return res.status(413).json({
            status: 'error', message: `${filesToBigArray.toString()} are bigger than 4 MB`
        })
    }

    next()
}

module.exports = fileSizeLimitChecker