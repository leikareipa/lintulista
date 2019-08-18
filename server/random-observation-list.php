<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 */

require_once "known-birds.php";

// Generates lists of random observations; such that repeat invocations may generate the
// exact same list a few times in succession. Used for e.g. returning semi-random results
// to queries made with invalid list keys.
//
// The most recently-returned list will be saved to disk and loaded in on successive
// instances of the class.
//
// Usage: Call get_list().
//
class RandomObservationList
{
    private $outputFilename;

    private $outputFile;

    function __construct()
    {
        $this->outputFilename = ($_SERVER['DOCUMENT_ROOT'] . "/../lintulista-random-observation-list.txt");
    }

    // Returns a list of random observations as an array of the following form:
    //
    //     [
    //         ["species"=>"...", "timestamp"=>...],
    //         ["species"=>"...", "timestamp"=>...],
    //         ...
    //     ]
    //
    // where 'species' is the name of a species from Lintulista's list of known species;
    // and 'timestamp' is a random timestamp for the observation.
    //
    function get_list(): array
    {
        $this->outputFile = fopen($this->outputFilename, "c+");
        flock($this->outputFile, LOCK_EX);

        $this->update_random_observations_list();

        fflush($this->outputFile);
        rewind($this->outputFile);
        $contents = explode(" ", file_get_contents($this->outputFilename));

        $numObservations = $contents[1];
        $observationData = array_slice($contents, 2, ($numObservations * 2));

        // Generate the observations.
        $observations = [];
        {
            $knownBirds = (new KnownBirds)->public_data();

            for ($i = 0; $i < $numObservations; $i++)
            {
                $birdSpecies = $knownBirds[min([$observationData[$i*2], (count($knownBirds) - 1)])]["species"];
                $timestamp = $observationData[$i*2+1];

                // Add the observation if one of this species doesn't already exist.
                if (array_search($birdSpecies, array_map(function($bird){return $bird["species"];}, $observations)) === false)
                {
                    $observations[] = ["species"=>$birdSpecies, "timestamp"=>$timestamp];
                }
            }
        }

        flock($this->outputFile, LOCK_UN);
        fclose($this->outputFile);

        return array_unique($observations, SORT_REGULAR);
    }

    private function generate_random_observation_list()
    {
        $numBirds = count((new KnownBirds)->public_data());
        $numReuses = random_int(0, 2); // How many times we'll allow the same list to be returned.
        $numObservations = random_int(0, $numBirds);
        $timeDelta = random_int(0, 47304000);

        $observations = [];
        for ($i = 0; $i < $numObservations; $i++)
        {
            $observations[] = random_int(0, ($numBirds - 1));
            $observations[] = random_int((time() - $timeDelta), time());
        }

        ftruncate($this->outputFile, 0);
        fflush($this->outputFile);
        rewind($this->outputFile);

        fprintf($this->outputFile, "%d %d %s", $numReuses, $numObservations, implode(" ", $observations));
        fflush($this->outputFile);
        rewind($this->outputFile);
    }

    private function update_random_observations_list()
    {
        if (!filesize($this->outputFilename))
        {
            $this->generate_random_observation_list();
            return;
        }

        rewind($this->outputFile);
        $contents = explode(" ", file_get_contents($this->outputFilename));

        $numReuses = ($contents[0] - 1);
        $numObservations = $contents[1];
        $observations = array_slice($contents, 2, ($numObservations * 2));

        if ($numReuses < 0)
        {
            $this->generate_random_observation_list();
            return;
        }

        ftruncate($this->outputFile, 0);
        fflush($this->outputFile);
        rewind($this->outputFile);

        fprintf($this->outputFile, "%d %d %s", $numReuses, $numObservations, implode(" ", $observations));
        fflush($this->outputFile);
        rewind($this->outputFile);
    }
}

?>
