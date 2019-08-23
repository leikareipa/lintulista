# wiki-image-fetch
A helper script for Lintulista; used as part of a toolchain to harvest bird thumbnails from Wikimedia.

The script selects for each in a user-supplied list of bird species a random image from Wikimedia associated there with that species, and stores the image's URL into an output file.

*Note:* The script does not guarantee that an image returned of a particular species will in fact be of that species, or even of a bird in general.

## Usage
### Step 1
Specify the species for which you want images fetched.

You can do this by populating `target-species.txt` with a list of newline-separated species names. For instance:
```
Viiksitimali
Tukkasotka
Jalohaikara
```

For a list of valid species names, see `known-species.json`. Species not listed there will be skipped.

Note that the species names in `target-species.txt` are case-sensitive and must match the form given in `known-species.json`.

### Step 2
Run the script.

```
$ php wiki-image-fetch.php
Parsed 3 of 3.
Finished parsing.
```

### Step 3
Obtain the script's output.

You'll find the image list produced by the script in `wiki-image-fetch-output.txt`.

For instance, the species names we gave it, above, will yield something like the following:
```
Viiksitimali^https://commons.wikimedia.org/wiki/File:Sk%C3%A4ggmes,_Fagersj%C3%B6viken,_S%C3%B6rmland,_February_2018_(30698868198).jpg
Tukkasotka^https://commons.wikimedia.org/wiki/File:Reiherente_(17)_(34217064593).jpg
Jalohaikara^https://commons.wikimedia.org/wiki/File:Garza_de_visita.JPG
```

Each line in the output file gives the name of the species, followed by a caret ^, followed by the Wikimedia URL.
