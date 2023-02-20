const path = require('path')

const fileTypeChecker = (allowedFileTypeArray) => {
    return (req, res, next) => {
        const files = req.files
        const fileTypes = []
        
        Object.keys(files).forEach(key => {
            fileTypes.push(path.extname(files[key].name))
        })

        // Are the file extension allowed?

        const allowed = fileTypes.every(type => allowedFileTypeArray.includes(type))

        if (!allowed) {
            return res.status(422).json({
                status: 'error', 
                message: `Upload failed, only fileTypes ${allowedFileTypeArray.toString()} are allowed`
            })
        }

        next()
    }
}

module.exports = fileTypeChecker