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

$knownSpecies = json_decode(file_get_contents("known-species.json"), true);
$targetSpecies = explode("\n", file_get_contents("target-species.txt"));
$output = fopen("wiki-image-fetch-output.txt", "w");

foreach ($targetSpecies as $idx=>$bird)
{
    if (array_key_exists($bird, $knownSpecies))
    {
        $speciesLatinName = $knownSpecies[$bird];
    }
    else
    {
        printf("\nUnknown species \"{$bird}\". Skipping it.\n");
        continue;
    }

    $imageUrl = select_random_image_url($speciesLatinName);

    if ($imageUrl)
    {
        fputs($output, "{$bird}^{$imageUrl}\n");
    }
    else
    {
        fputs($output, "{$bird}^-\n");
    }

    printf("\rParsed %d of %d.", $idx+1, count($targetSpecies));

    // Don't hammer the server with too many requests per unit of time.
    if ($idx !== (count($targetSpecies) - 1))
    {
        sleep(1);
    }
}

printf("\nFinished parsing.\n");

// Fetches Wikimedia's Commons or Species page for the given bird species (whose name is
// to be given in Latin with spaces replaced by underscores, e.g. Branta_ruficollis), and
// returns from among the images on that page a random one as a Wikimedia File URL of the
// form https://commons.wikimedia.org/wiki/File:xxx. If no images could be found, returns
// an empty string.
function select_random_image_url(string $latinSpeciesName): string
{
    global $output;

    $htmlData = file_get_contents("https://commons.wikimedia.org/wiki/Category:{$latinSpeciesName}");

    // See whether this is a redirecting page; and if so, grab the target page's HTML,
    // instead.
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
