<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Selects for all of Lintulista's known bird species a random image from Wikimedia. The
 * image will be stored as Wikimedia URLs into the output file wiki-image-fetch-output.txt.
 * 
 * NOTE: The script does not guarantee that an image returned of a particular species is
 * in fact of that species, or even of a bird in general. The script simply relies on
 * Wikimedia hosting relevant content.
 * 
 */

$species = file_get_contents("latin-species.txt");
$species = explode("\n", $species);

$output = fopen("wiki-image-fetch-output.txt", "w");

foreach ($species as $idx=>$bird)
{
    // [0] will be the species name in Latin, and [1] the species name in Finnish.
    $bird = explode(",", $bird);

    $imageUrl = select_random_image_url($bird[0]);

    if ($imageUrl)
    {
        fputs($output, "{$bird[1]}^{$imageUrl}\n");
    }
    else
    {
        fputs($output, "{$bird[1]}^-\n");
    }

    printf("\rParsed %d of %d.", $idx+1, count($species));

    sleep(1);
}

// Fetches Wikimedia's Commons or Species page for the given bird species (whose name is
// to be given in Latin with spaces replaced by underscores, e.g. Branta_ruficollis), and
// returns from among the images on that page a random one as a Wikimedia File URL of the
// form https://commons.wikimedia.org/wiki/File:xxx. If no images could be found, returns
// an empty string.
function select_random_image_url(string $latinSpeciesName): string
{
    global $output;

    $htmlData = file_get_contents("https://commons.wikimedia.org/wiki/Category:{$latinSpeciesName}");

    // See whether this is a redirecting page; and if so, grab the target page's HTML, instead.
    if (preg_match("/This category is located at <b><a href=\"(\/wiki\/Category:[^\"]+)/", $htmlData, $redirectMatch))
    {
        $htmlData = file_get_contents("https://commons.wikimedia.org{$redirectMatch[1]}");
    }

    // Extract from the HTML the filenames of the images of this species, and return from
    // among them a random one.
    if (preg_match_all("/\/wiki\/File:[^\"]*?.(?i)(png|jpe?g)(?-i)/", $htmlData, $birdImageFilenames))
    {
        return "https://commons.wikimedia.org{$birdImageFilenames[0][random_int(0, count($birdImageFilenames[0])-1)]}";
    }
    else
    {
        return "";
    }
}

?>
