FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginFileValidateType
)
FilePond.setOptions({
    acceptedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
})

FilePond.parse(document.body);