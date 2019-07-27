<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Initializes Lintulista's database tables.
 * 
 * This utility script is meant to be run by the administrator of a Lintulista server.
 * This script does not need to be end-user-accessible.
 * 
 * Before running this script, note that your database credentials must be set. See
 * "lintulista/server/database.php".
 * 
 */

// Assumes we're in "lintulista/tools/", and that the server-side scripts are in
// "lintulista/server/".
chdir("../server/");

require_once "database.php";

// A table that holds metadata about each observation list. This table will be
// modified when new lists are added.
database_command("CREATE TABLE lintulista_lists(
                    list_id MEDIUMINT unsigned AUTO_INCREMENT PRIMARY KEY,
                    view_key VARCHAR(7) NOT NULL UNIQUE KEY,
                    edit_key VARCHAR(60) NOT NULL UNIQUE KEY,
                    creation_timestamp BIGINT NOT NULL,
                    creator_hash TEXT
                 )");

// A table that collects together all observations from all lists. This table will
// be modified when a user adds or deletes an observation from their list, or otherwise
// alters an observation's time, place, etc.
database_command("CREATE TABLE lintulista_observations(
                    id INT unsigned AUTO_INCREMENT PRIMARY KEY,
                    list_id MEDIUMINT unsigned NOT NULL,
                    `timestamp` BIGINT NOT NULL,
                    species TEXT NOT NULL,
                    place TEXT,
                    INDEX `list_id` (`list_id`)
                 )");

echo "Done.";

?>
