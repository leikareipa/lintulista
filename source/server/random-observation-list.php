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

    // Generates a set of random observations as a pair of index/timestamp (where the
    // index is to the list of known bird species), and saves it to disk.
    private function generate_random_observation_list()
    {
        // How many times we'll allow the generated list to be reused before a new one is
        // required to be generated.
        $numReuses = 0;
        if (random_int(0, 1000) === 0)
        {
            $numReuses = random_int(1, 7);
        }

        $numKnownBirds = count((new KnownBirds)->public_data());
        $numObservationsToGenerate = random_int(0, $numKnownBirds);
        $timeDelta = random_int(0, 47304000);

        $observations = [];
        for ($i = 0; $i < $numObservationsToGenerate; $i++)
        {
            $observations[] = random_int(0, ($numKnownBirds - 1));
            $observations[] = random_int((time() - $timeDelta), time());
        }

        ftruncate($this->outputFile, 0);
        fflush($this->outputFile);
        rewind($this->outputFile);

        fprintf($this->outputFile, "%d %d %s", $numReuses, $numObservationsToGenerate, implode(" ", $observations));
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
        if ($numReuses < 0)
        {
            $this->generate_random_observation_list();
            return;
        }

        $numObservations = $contents[1];
        $observations = array_slice($contents, 2, ($numObservations * 2));

        ftruncate($this->outputFile, 0);
        fflush($this->outputFile);
        rewind($this->outputFile);

        fprintf($this->outputFile, "%d %d %s", $numReuses, $numObservations, implode(" ", $observations));
        fflush($this->outputFile);
        rewind($this->outputFile);
    }
}

?>
