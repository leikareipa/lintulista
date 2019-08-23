# wiki-image-thumbnailer
A helper app for Lintulista; used as part of a toolchain to harvest bird thumbnails from Wikimedia.

The app takes as input a list of Wikimedia image URLs, and produces as output for each image a thumbnail PNG + a textual brief of the image's licensing information.

*Note:* The app is not optimized for usability, clean code, maintainability, or the like; it's simply a quickly-made tool to get a job done.

## Building
The app uses C++ (GCC) and Qt (5).

You can build it by running the following:
```
$ qmake && make
```

## Usage
### Step 1
Before building, provide the list of Wikimedia image URLs.

You can do this by appending the URLs to `populate_images_list()` in [mainwindow.cpp](mainwindow.cpp). For instance:
```
void MainWindow::populate_images_list()
{
    this->images << "Metsähanhi^https://commons.wikimedia.org/wiki/File:Grau-_und_Saatg%C3%A4nse_(1)_(34988246936).jpg"
                 << "Lyhytnokkahanhi^https://commons.wikimedia.org/wiki/File:Anser_Brachyrhynchus_IUCN_v2018_2.png";
}
```

The URLs are given in the format output by the `wiki-image-fetch` tool - that is, the name of the species, followed by a caret ^, followed by the Wikimedia image URL.

*Note:* The Wikimedia image URL should be of the "File:" variety - i.e. pointing not to the actual image but to the image's Wikimedia page.

### Step 2
Run the app.

The app will fetch the images one by one in the order given in Step 1. For each image, the app will display relevant licensing information and the image itself.

By clicking on the app's image display, you can set the region from which the thumbnail will be extracted. You can use the mouse scrollwheel to adjust the size of the region.

Once you are satisfied, click the Save button. The app will generate two files into the `content` sub-directory: a text file containing the image's licensing information, and a PNG file containing the thumbnail. A UUID will be assigned as the files' base name.

If you don't want to save the current image, click the Skip button. The species name will be recorded into the `content/skipped.txt` file, and the next image will be loaded.

*Note:* The app harvests a given image's licensing information from the image's Wikimedia page. This process is not without error, however: in some cases, you may find that the information is partial or otherwise incorrect. Always verify the licensing information prior to saving the image.
