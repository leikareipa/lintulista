/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 *
 */

#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QNetworkAccessManager>
#include <QRegularExpression>
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QImageReader>
#include <QDebug>
#include <QTimer>
#include <QUuid>
#include <fstream>

/// Temp hack. Used to store the names of species whose image was skipped.
std::ofstream skipped("content/skipped.txt");

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    ui->plainTextEdit_licenseDetails->setStyleSheet("background-color: lightgray; color: black;");

    this->populate_images_list();

    this->next_image();

    return;
}

MainWindow::~MainWindow()
{
    delete ui;

    return;
}

void MainWindow::next_image()
{
    QStringList next = this->images.at(0).split("^");

    this->images.removeFirst();

    this->fetch_wikimedia_resource(next.at(0), next.at(1));

    return;
}

// Parses the given HTML source code to extract relevant metadata out of it. Note that
// in some cases, this will fail to correctly parse the data - it works 'well enough'.
image_metadata_s MainWindow::get_image_metadata(const QString html)
{
    image_metadata_s metadata;

    QRegularExpressionMatch imageUrlMatch;
    if (html.contains(QRegularExpression("class=\"fullImageLink\"[^>]+><a href=\"([^\"]+)\">"), &imageUrlMatch))
    {
        metadata.directImageUrl = imageUrlMatch.captured(1);
    }
    else
    {
        /// TODO. Handle failure to find the image URL.
    }

    QRegularExpressionMatch licenseMatch;
    if (html.contains(QRegularExpression("<span class=\"licensetpl_short\">(Public domain)</span>"), &licenseMatch) ||
        html.contains(QRegularExpression("This file is made available under the (.*?).", QRegularExpression::DotMatchesEverythingOption), &licenseMatch) ||
        html.contains(QRegularExpression("This file is licensed under the (.*?) license.", QRegularExpression::DotMatchesEverythingOption), &licenseMatch))
    {
        metadata.licenseDetails = licenseMatch.captured(1);
    }
    else
    {
        /// TODO. Handle failure to find the image URL.
    }

    QRegularExpressionMatch authorNameMatch;
    if (html.contains(QRegularExpression(">Author</td>.+?<td>(.*?)</td>", QRegularExpression::DotMatchesEverythingOption), &authorNameMatch))
    {
        metadata.authorName = authorNameMatch.captured(1);

        metadata.authorName.replace("&amp;", "&");
    }
    else
    {
        if (metadata.licenseDetails == "Public domain")
        {
            metadata.authorName = "(N/A)";
        }
    }

    return metadata;
}

void MainWindow::fetch_wikimedia_resource(const QString speciesName, const QString url)
{
    QNetworkAccessManager *manager = new QNetworkAccessManager(this);
    connect(manager, &QNetworkAccessManager::finished, [=](QNetworkReply *reply)
    {
        if (reply->error() == QNetworkReply::NoError)
        {
            QString responseHtml = reply->readAll();

            this->currentImageMetadata = this->get_image_metadata(responseHtml);
            this->currentImageMetadata.speciesName = speciesName;
            this->currentImageMetadata.wikimediaImageUrl = url;
            this->currentImageMetadata.wikimediaImageUrl.replace("https://commons.wikimedia.org", "");

            this->update_display_image();
            this->update_gui_metadata_info();
        }
        else
        {
            /// TODO. Handle the error.
        }
    });

    manager->get(QNetworkRequest(QUrl(url)));

    return;
}

void MainWindow::update_gui_metadata_info()
{
    ui->lineEdit_author->setText(this->currentImageMetadata.authorName);
    ui->lineEdit_file->setText(this->currentImageMetadata.wikimediaImageUrl);
    ui->plainTextEdit_licenseDetails->document()->setHtml(this->currentImageMetadata.licenseDetails);

    return;
}

void MainWindow::update_display_image()
{
    QNetworkAccessManager *manager = new QNetworkAccessManager(this);
    connect(manager, &QNetworkAccessManager::finished, [this](QNetworkReply *reply)
    {
        if (reply->error() == QNetworkReply::NoError)
        {
            QImageReader imageReader(reply);
            QImage image = imageReader.read();

            ui->widget_imageDisplay->display_image(image);
        }
        else
        {
            /// TODO. Handle the error.
        }
    });

    manager->get(QNetworkRequest(QUrl(this->currentImageMetadata.directImageUrl)));

    return;
}

void MainWindow::save()
{
    const QString baseName = ("content/" + QUuid::createUuid().toString().replace(QRegularExpression("{|}"), ""));

    ui->widget_imageDisplay->get_selected_subregion().save(baseName + ".png");

    std::ofstream f(baseName.toStdString() + ".txt");
    f << this->currentImageMetadata.speciesName.toStdString() << "\n"
      << this->currentImageMetadata.authorName.toStdString() << "\n"
      << this->currentImageMetadata.licenseDetails.toStdString();
    f.close();

    this->next_image();

    return;
}

void MainWindow::skip()
{
    skipped << this->currentImageMetadata.speciesName.toStdString() << "\n";
    skipped.flush();

    this->next_image();

    return;
}

void MainWindow::on_pushButton_save_clicked()
{
    ui->pushButton_save->setEnabled(false);
    QTimer::singleShot(1500, [this]{this->ui->pushButton_save->setEnabled(true);});

    this->save();

    return;
}

void MainWindow::on_pushButton_skip_clicked()
{
    ui->pushButton_skip->setEnabled(false);
    QTimer::singleShot(1500, [this]{this->ui->pushButton_skip->setEnabled(true);});

    this->skip();

    return;
}

// Paste here the output of wiki-image-fetch.php.
void MainWindow::populate_images_list()
{
    this->images << "Metsähanhi^https://commons.wikimedia.org/wiki/File:Grau-_und_Saatg%C3%A4nse_(1)_(34988246936).jpg"
                 << "Lyhytnokkahanhi^https://commons.wikimedia.org/wiki/File:Anser_Brachyrhynchus_IUCN_v2018_2.png"
                 << "Tundrahanhi^https://commons.wikimedia.org/wiki/File:Greater_White-fronted_Geese_(2),_76th_St_flooded_field_between_Breton_and_Hanna_Lake_Rds,_Kent_Co.,_MI,_March_3,_2012_(6949780857).jpg"
                 << "Kiljuhanhi^https://commons.wikimedia.org/wiki/File:Fj%C3%A4llg%C3%A5s,_S%C3%A4tunaviken,_%C3%96sterg%C3%B6tland,_April_2017_1.jpg"
                 << "Lumihanhi^https://commons.wikimedia.org/wiki/File:Chen_caerulescens_37997.JPG"
                 << "Kanadanhanhi^https://commons.wikimedia.org/wiki/File:Canada_goose._Branta_canadensis_-_Flickr_-_gailhampshire.jpg"
                 << "Valkoposkihanhi^https://commons.wikimedia.org/wiki/File:Branta_leucopsis_EM1B0362_(27285878907).jpg"
                 << "Ruostesorsa^https://commons.wikimedia.org/wiki/File:DSC09276_(6467268467).jpg"
                 << "Amerikanhaapana^https://commons.wikimedia.org/wiki/File:American_Wigeon_(24032250408).jpg"
                 << "Harmaasorsa^https://commons.wikimedia.org/wiki/File:Gadwall_on_Seedskadee_National_Wildlife_Refuge_(37725420056).jpg"
                 << "Tavi^https://commons.wikimedia.org/wiki/File:Common_Teal_(Anas_crecca)_(25766144088).jpg"
                 << "Amerikantavi^https://commons.wikimedia.org/wiki/File:TEAL,_GREEN-WINGED_(11-1-10)_patagonia_lake,_scc,_az_-03_(5137708352).jpg"
                 << "Lapasorsa^https://commons.wikimedia.org/wiki/File:Duck_Quiz_(30283869960).jpg"
                 << "Punapäänarsku^https://commons.wikimedia.org/wiki/File:Red-crested_Pochard_Netta_rufina_(45374683855).jpg"
                 << "Amerikantukkasotka^https://commons.wikimedia.org/wiki/File:Ring-necked_duck_female_papago_park_(14104718070).jpg"
                 << "Pikkulapasotka^https://commons.wikimedia.org/wiki/File:Lesser_Scaup.jpg"
                 << "Haahka^https://commons.wikimedia.org/wiki/File:Common_Eider_RWD3.jpg"
                 << "Kyhmyhaahka^https://commons.wikimedia.org/wiki/File:King_Eider_-16_100-_(33903093376).jpg"
                 << "Virta-alli^https://commons.wikimedia.org/wiki/File:Harlequin_Duck_(31751405428).jpg"
                 << "Amerikanmustalintu^https://commons.wikimedia.org/wiki/File:055_-_BLACK_SCOTER_(12-17-13)_tucson,_az_-01_(11429497856).jpg"
                 << "Pilkkaniska^https://commons.wikimedia.org/wiki/File:Surf_Scoter_-_First_Winter_(8171162396).jpg"
                 << "Pilkkasiipi^https://commons.wikimedia.org/wiki/File:Melanitta_fusca_1.jpg"
                 << "Tukkakoskelo^https://commons.wikimedia.org/wiki/File:Red-breasted_Merganser_(Mergus_serrator)_(4).JPG"
                 << "Isokoskelo^https://commons.wikimedia.org/wiki/File:Storskrake-0079_-_Flickr_-_Ragnhild_%26_Neil_Crawford.jpg"
                 << "Pyy^https://commons.wikimedia.org/wiki/File:Tetrastes_bonasia_2.jpg"
                 << "Teeri^https://commons.wikimedia.org/wiki/File:Norwegisches_Birkhuhn.jpg"
                 << "Metso^https://commons.wikimedia.org/wiki/File:Tetrao_urogallus_(mating_display)_(39644196620).jpg"
                 << "Fasaani^https://commons.wikimedia.org/wiki/File:Pheasant_cock_(Phasianus_colchicus)_in_the_snow.jpg"
                 << "Tundrakuikka^https://commons.wikimedia.org/wiki/File:092_-_PACIFIC_LOON_(10-26-10)_patagonia_lake_state_park,_scc,_az_(2)_(8720118965).jpg"
                 << "Jääkuikka^https://commons.wikimedia.org/wiki/File:094_-_YELLOW-BILLED_LOON_(6-18-2016)_barrow,_alaska_-03_(28204259296).jpg"
                 << "Silkkiuikku^https://commons.wikimedia.org/wiki/File:UCS_1933.jpg"
                 << "Pikkuliitäjä^https://commons.wikimedia.org/wiki/File:Puffinus_puffinus_-Iceland_-flying-6_(2).jpg"
                 << "Merikeiju^https://commons.wikimedia.org/wiki/File:St_Alban%27s_-_Bunce_reredos_-_Andy_Mabbett_-_07.JPG"
                 << "Myrskykeiju^https://commons.wikimedia.org/wiki/File:Oceanodroma_leucorhoa_MWNH_0538.JPG"
                 << "Madeirankeiju^https://commons.wikimedia.org/wiki/File:Band_rumped_storm_petrel_Andre_Raine_KESRP_(21789178016).jpg"
                 << "Suula^https://commons.wikimedia.org/wiki/File:Ecomare_-_jan-van-gent_nieuwe_bewoner_(jan-van-gent-nieuwebewoner-2015-8907-sw).jpg"
                 << "Lehmähaikara^https://commons.wikimedia.org/wiki/File:Avescaico.JPG"
                 << "Jalohaikara^https://commons.wikimedia.org/wiki/File:Gar%C3%A7a_branca_grande.jpg"
                 << "Pronssi-iibis^https://commons.wikimedia.org/wiki/File:Glossy_Ibis,_Plegadis_falcinellus_at_Marievale_Nature_Reserve,_Gauteng,_South_Africa._Marievale_is_probably_the_best_place_to_see_this_bird._(20491490024).jpg"
                 << "Kapustahaikara^https://commons.wikimedia.org/wiki/File:FlamingoInAction4.jpg"
                 << "Haarahaukka^https://commons.wikimedia.org/wiki/File:Brown_Falcon.jpg"
                 << "Aromerikotka^https://commons.wikimedia.org/wiki/File:Pallas%27s_Fish_Eagle_(_Haliaeetus_leucoryphus)_2.jpg"
                 << "Pikkukorppikotka^https://commons.wikimedia.org/wiki/File:Egyptian_vulture_(Neophron_percnopterus)_and_feral_dog_Bikaner_Jorbeed_JEG5001.jpg"
                 << "Varpushaukka^https://commons.wikimedia.org/wiki/File:Sparrowhawk_Accipiter_nisus_(37954623086).jpg"
                 << "Hiirihaukka^https://commons.wikimedia.org/wiki/File:Baz-3.jpg"
                 << "Piekana^https://commons.wikimedia.org/wiki/File:Rough-legged_Hawk_(11911992876).jpg"
                 << "Keisarikotka^https://commons.wikimedia.org/wiki/File:Kenia_2012_(151).JPG"
                 << "Tuulihaukka^https://commons.wikimedia.org/wiki/File:Kestrel_(2856030831).jpg"
                 << "Ampuhaukka^https://commons.wikimedia.org/wiki/File:Burnt_Island_Lake-_site_at_point_that_points_into_the_Bay_that_backs_onto_Baden_Powell_Lake_(23437157991).jpg"
                 << "Välimerenhaukka^https://commons.wikimedia.org/wiki/File:Eleonora%27s_Falcon_(4989420527).jpg"
                 << "Aavikkohaukka^https://commons.wikimedia.org/wiki/File:%D9%85%D9%86%D8%A7%D8%B7%D9%82_%D8%A5%D9%86%D8%AA%D8%B4%D8%A7%D8%B1_%D8%A7%D9%84%D8%B5%D9%82%D8%B1_%D8%A7%D9%84%D8%AD%D8%B1.png"
                 << "Tunturihaukka^https://commons.wikimedia.org/wiki/File:Falco_rusticolus_white.jpg"
                 << "Muuttohaukka^https://commons.wikimedia.org/wiki/File:Peregrine_falcon_at_Phoolbari,_Kavre_(9).jpg"
                 << "Luhtakana^https://commons.wikimedia.org/wiki/File:Rallus_aquaticus_distribution.png"
                 << "Luhtahuitti^https://commons.wikimedia.org/wiki/File:Porzana_porzana_3_(Marek_Szczepanek).jpg"
                 << "Pikkuhuitti^https://commons.wikimedia.org/wiki/File:Little_Crake_(Porzana_parva)_(39212429975).jpg"
                 << "Kääpiöhuitti^https://commons.wikimedia.org/wiki/File:Porzana_pusilla,_Baillon%27s_Crake_.jpg"
                 << "Kurnuliejukana^https://commons.wikimedia.org/wiki/File:AbbildungenvonV1Meye_0173_Porphyrio_chloronotus.jpg"
                 << "Hietakurki^https://commons.wikimedia.org/wiki/File:Sandhill_Crane_in_Love%5E_(_Grus_canadensis_pratensis_)_-_Flickr_-_Andrea_Westmoreland.jpg"
                 << "Neitokurki^https://commons.wikimedia.org/wiki/File:Demoiselle_Cranes_flying_on_the_sky_at_Khichan_(11).jpg"
                 << "Idänkaulustrappi^https://commons.wikimedia.org/wiki/File:Macqueen%27s_Bustard_(Chlamydotis_macqueenii).jpg"
                 << "Avosetti^https://commons.wikimedia.org/wiki/File:Pied_Avocet,_Recurvirostra_avosetta_at_Marievale_Nature_Reserve,_Gauteng,_South_Africa_(20846372828).jpg"
                 << "Amerikankurmitsa^https://commons.wikimedia.org/wiki/File:Pluvialis_dominica_eggs_and_nest.jpg"
                 << "Preeriakahlaaja^https://commons.wikimedia.org/wiki/File:Upland_Sandpiper_(8372114938).jpg"
                 << "Kuovi^https://commons.wikimedia.org/wiki/File:Flying_(5486768935).jpg"
                 << "Mustapyrstökuiri^https://commons.wikimedia.org/wiki/File:Limosa_limosa_stretch_-_Christopher_Watson.jpg"
                 << "Isosirri^https://commons.wikimedia.org/wiki/File:Kwokacz1.jpg"
                 << "Kuovisirri^https://commons.wikimedia.org/wiki/File:Krombekstrandloper-1_(28541319762).jpg"
                 << "Siperiansirri^https://commons.wikimedia.org/wiki/File:Long-toed_Stint_0404.jpg"
                 << "Merisirri^https://commons.wikimedia.org/wiki/File:Adventfjorden_Calidris_maritima_IMG_3571.JPG"
                 << "Eskimosirri^https://commons.wikimedia.org/wiki/File:Baird%27s_Sandpiper_-_Terra_Fuoco_-_Argentina0002_(15842844132).jpg"
                 << "Pikkusirri^https://commons.wikimedia.org/wiki/File:Little_Stint_(Calidris_minuta)_(8079441052).jpg"
                 << "Mustaviklo^https://commons.wikimedia.org/wiki/File:Spotted_Redshank_(Tringa_erythropus).jpg"
                 << "Keltajalkaviklo^https://commons.wikimedia.org/wiki/File:Lesser_Yellowlegs_(Tringa_flavipes)_in_Lake_McDonald_-_Flickr_-_Jay_Sturner.jpg"
                 << "Preeriaviklo^https://commons.wikimedia.org/wiki/File:Willet_Bolivar_Flats_TX_2018-04-16_09-16-51_(41229331374).jpg"
                 << "Lampiviklo^https://commons.wikimedia.org/wiki/File:Marsh_Sandpiper,_Tringa_stagnatilis_(I_think)_at_Borakalalo_National_Park,_South_Africa_(9900259536).jpg"
                 << "Liro^https://commons.wikimedia.org/wiki/File:Feeding_(9468018589).jpg"
                 << "Jänkäkurppa^https://commons.wikimedia.org/wiki/File:Snipes_(6876115551).jpg"
                 << "Siperiankurppa^https://commons.wikimedia.org/wiki/File:Gallinago_megala.jpg"
                 << "Aropääskykahlaaja^https://commons.wikimedia.org/wiki/File:Aquila_(1971)_(19125818084).jpg"
                 << "Pikkutiira^https://commons.wikimedia.org/wiki/File:Little_Tern_with_Crested_Terns.jpg"
                 << "Hietatiira^https://commons.wikimedia.org/wiki/File:One_(5628909155).jpg"
                 << "Mustatiira^https://commons.wikimedia.org/wiki/File:Black_Terns_off_Cora_Island_Beach_(47839800372).jpg"
                 << "Riuttatiira^https://commons.wikimedia.org/wiki/File:Sandwich_Tern_-_Farne_Is_-FJ0A5168_(35937297300).jpg"
                 << "Kalatiira^https://commons.wikimedia.org/wiki/File:Sterna_hirundo_EM1B2476_(43321425232).jpg"
                 << "Ruusulokki^https://commons.wikimedia.org/wiki/File:Ross%27s_Gull_(adult),_Red_Rock_Reservoir,_Iowa,_3_December_2013_(11206108503).jpg"
                 << "Jäälokki^https://commons.wikimedia.org/wiki/File:Ivory_Gull_-_Pagophila_eburnea_-_%C3%8Dsm%C3%A1fur.jpg"
                 << "Naurulokki^https://commons.wikimedia.org/wiki/File:Friends_(6523495157).jpg"
                 << "Grönlanninlokki^https://commons.wikimedia.org/wiki/File:Adult_Larus_glaucoides,_Swallow_Pond_6.jpg"
                 << "Kalliokyyhky^https://commons.wikimedia.org/wiki/File:Common_pigeon_(Columba_livia)_-_Wiki_Loves_Birds_25.jpg"
                 << "Turkinkyyhky^https://commons.wikimedia.org/wiki/File:Gugutka_-_Streptopelia_decaocto,_Ni%C5%A1_(9).jpg"
                 << "Idänturturikyyhky^https://commons.wikimedia.org/wiki/File:Informationstafel_R%C3%B6hrensee_23.jpg"
                 << "Kyläpöllönen^https://commons.wikimedia.org/wiki/File:Zwergohreule,_ein_H%C3%B6hlenbr%C3%BCter_in_K%C3%B6ttmannsdorf,_K%C3%A4rnten,_%C3%96sterreich.jpg"
                 << "Huuhkaja^https://commons.wikimedia.org/wiki/File:Velk%C3%A1_pta%C4%8D%C3%AD_voli%C3%A9ra_(z%C3%A1mek_Poln%C3%A1)_07.jpg"
                 << "Varpuspöllö^https://commons.wikimedia.org/wiki/File:Juvenile_Eurasian_Pygmy_Owl_(Glaucidium_passerinum),_Eastern_Belgium_(14544786334).jpg"
                 << "Sarvipöllö^https://commons.wikimedia.org/wiki/File:B%C3%ABscheil_beim_M%C3%ABttestomp-106.jpg"
                 << "Helmipöllö^https://commons.wikimedia.org/wiki/File:Boreal_Owl_-_Flickr_-_GregTheBusker_(1).jpg"
                 << "Kehrääjä^https://commons.wikimedia.org/wiki/File:Caprimulgus_europaeus_2_edited.jpg"
                 << "Piikkipyrstökiitäjä^https://commons.wikimedia.org/wiki/File:White-throated_needletail_1.jpg"
                 << "Alppikiitäjä^https://commons.wikimedia.org/wiki/File:Alpine_Swift_Tachymarptis_melba_by_Dr._Raju_Kasambe_DSCN4851_(6).jpg"
                 << "Häätökiitäjä^https://commons.wikimedia.org/wiki/File:White-rumped_swift,_Apus_caffer,_at_Suikerbosrand_Nature_Reserve,_Gauteng,_South_Africa_(23244600642).jpg"
                 << "Mehiläissyöjä^https://commons.wikimedia.org/wiki/File:Bird_1170565_cr.jpg"
                 << "Harjalintu^https://commons.wikimedia.org/wiki/File:Upupa_epops,_pupavac_1.jpg"
                 << "Harmaapäätikka^https://commons.wikimedia.org/wiki/File:Grijskopspecht-4_(28541492722).jpg"
                 << "Vihertikka^https://commons.wikimedia.org/wiki/File:Green_Woodpecker_(Picus_viridis)_-_geograph.org.uk_-_1195643.jpg"
                 << "Palokärki^https://commons.wikimedia.org/wiki/File:2016.08.27.-13-Viernheimer_Heide-Viernheim--Schwarzspecht-Weibchen.jpg"
                 << "Pikkutikka^https://commons.wikimedia.org/wiki/File:Mali_detli%C4%87_-_Dendrocopos_minor.jpg"
                 << "Pohjantikka^https://commons.wikimedia.org/wiki/File:Tret%C3%A5ig_hackspett,_Fun%C3%A4sdalen,_H%C3%A4rjedalen,_Juni_2017_(38003947376).jpg"
                 << "Arokiuru^https://commons.wikimedia.org/wiki/File:%D0%9F%D1%82%D0%B0%D1%88%D0%B5%D0%BD%D1%8F_%D1%81%D1%82%D0%B5%D0%BF%D0%BE%D0%B2%D0%BE%D0%B3%D0%BE_%D0%B6%D0%B0%D0%B9%D0%B2%D0%BE%D1%80%D0%BE%D0%BD%D0%BA%D0%B0_%D0%BD%D0%B0_%D0%B5%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%BE%D0%BD%D0%B8%D1%85_%D1%82%D0%B5%D1%80%D0%B5%D0%B7%D0%B0%D1%85.jpg"
                 << "Ylänkökiuru^https://commons.wikimedia.org/wiki/File:Melanocorypha_bimaculata.jpg"
                 << "Valkosiipikiuru^https://commons.wikimedia.org/wiki/File:Blankflugila-ala%C5%ADdo.jpg"
                 << "Tunturikiuru^https://commons.wikimedia.org/wiki/File:Horned_lark_on_Seedskadee_National_Wildlife_Refuge_(33686490735).jpg"
                 << "Kalliopääsky^https://commons.wikimedia.org/wiki/File:Eurasian_Crag_Martin_(Ptyonoprogne_rupestris)_(24770002657).jpg"
                 << "Haarapääsky^https://commons.wikimedia.org/wiki/File:Hirondelle_La_Serre-Bussi%C3%A8re-Vieille_%C3%A9glise.jpg"
                 << "Räystäspääsky^https://commons.wikimedia.org/wiki/File:Delichon_urbicum_in_Carinthia_10.JPG"
                 << "Metsäkirvinen^https://commons.wikimedia.org/wiki/File:Tree_Pipit_(Anthus_trivialis)_(38212991371).jpg"
                 << "Tundrakirvinen^https://commons.wikimedia.org/wiki/File:Pechora_Pipit_spring_Attu-island_Alaska.jpg"
                 << "Sitruunavästäräkki^https://commons.wikimedia.org/wiki/File:Motacilla_citreola_(2).JPG"
                 << "Tilhi^https://commons.wikimedia.org/wiki/File:Seidenschw%C3%A4nze_auf_Baum.JPG"
                 << "Koskikara^https://commons.wikimedia.org/wiki/File:Cinclus_cinclus_-Brandon_Creek,_County_Kerry,_Ireland-8.jpg"
                 << "Taigarautiainen^https://commons.wikimedia.org/wiki/File:ACCENTOR,_SIBERIAN_(9-15-08)_Gambell,_Ak_-01_(2860815677).jpg"
                 << "Ruostepyrstö^https://commons.wikimedia.org/wiki/File:Cercotrichas_galactotes_-_Rufous-tailed_Scrub_Robin_01.jpg"
                 << "Sinipyrstö^https://commons.wikimedia.org/wiki/File:Walking_(9420827374).jpg"
                 << "Pensastasku^https://commons.wikimedia.org/wiki/File:Braunkehlchen_(Saxicola_rubetra),_Warchetal_bei_H%C3%BCnningen,_Ostbelgien_(9198378193).jpg"
                 << "Nokitasku^https://commons.wikimedia.org/wiki/File:Pied_Bushchat_-_Saxicola_caprata_-_DSC04840.jpg"
                 << "Nunnatasku^https://commons.wikimedia.org/wiki/File:Pied_Wheatear_(Oenanthe_pleschanka)_(8079431820).jpg"
                 << "Kivikkorastas^https://commons.wikimedia.org/wiki/File:Monticole_de_Roche.jpg"
                 << "Kirjorastas^https://commons.wikimedia.org/wiki/File:The_birds_of_Yorkshire_-_being_a_historical_account_of_the_avi-fauna_of_the_County_(1907)_(14750853645).jpg"
                 << "Mustarastas^https://commons.wikimedia.org/wiki/File:Amsel_(10)_(34857302702).jpg"
                 << "Ruostesiipirastas^https://commons.wikimedia.org/wiki/File:Turdus_eunomus_1.jpg"
                 << "Punakylkirastas^https://commons.wikimedia.org/wiki/File:Garden_visitor_IMG_7622_(13519444693).jpg"
                 << "Viirusirkkalintu^https://commons.wikimedia.org/wiki/File:Naturalis_Biodiversity_Center_-_RMNH.AVES.92961_1_-_Locustella_lanceolata_(Temminck,_1840)_-_Sylviidae_-_bird_skin_specimen.jpeg"
                 << "Viitasirkkalintu^https://commons.wikimedia.org/wiki/File:Krekelzanger-2_(28030900964).jpg"
                 << "Vaaleakultarinta^https://commons.wikimedia.org/wiki/File:Iduna_pallida.jpg"
                 << "Sarakerttunen^https://commons.wikimedia.org/wiki/File:Acrocephalus_paludicola_1_by-dpc.jpg"
                 << "Rastaskerttunen^https://commons.wikimedia.org/wiki/File:Acrocephalus_arundinaceus_Beetzer_See_10.05.2014_16-01-048.jpg"
                 << "Kirjokerttu^https://commons.wikimedia.org/wiki/File:Sylvia_nisoria_(37281583374).jpg"
                 << "Pensaskerttu^https://commons.wikimedia.org/wiki/File:Sylvia_communis_insect.jpg"
                 << "Amurinuunilintu^https://commons.wikimedia.org/wiki/File:Phylloscopus_coronatus.jpg"
                 << "Burjatianuunilintu^https://commons.wikimedia.org/wiki/File:Phylloscopus_plumbeitarsus_1889.jpg"
                 << "Hippiäisuunilintu^https://commons.wikimedia.org/wiki/File:Phylloscopus_proregulus.jpg"
                 << "Taigauunilintu^https://commons.wikimedia.org/wiki/File:Watching_(8406344689).jpg"
                 << "Ruskouunilintu^https://commons.wikimedia.org/wiki/File:Dusky_Warbler_-_Redwood_Creek_-_Muir_Woods_-_CA_-_2015-10-19at09-36-38_(22389926678).jpg"
                 << "Pajulintu^https://commons.wikimedia.org/wiki/File:Guadalcanal,_41390,_Sevilla,_Spain_-_panoramio_(1).jpg"
                 << "Harmaasieppo^https://commons.wikimedia.org/wiki/File:Muscicapa_striata_-_Spotted_flycatcher_01-1.jpg"
                 << "Viitatiainen^https://commons.wikimedia.org/wiki/File:Sumpfmeise1.jpg"
                 << "Kuhankeittäjä^https://commons.wikimedia.org/wiki/File:Oriolus_oriolus_1.jpg"
                 << "Punapyrstölepinkäinen^https://commons.wikimedia.org/wiki/File:Lanius_isabellinus_in_Kentau_02.jpg"
                 << "Etelänisolepinkäinen^https://commons.wikimedia.org/wiki/File:Iberische-klapekster-2_(28719510695).jpg"
                 << "Kuukkeli^https://commons.wikimedia.org/wiki/File:Perisoreus_Infaustus_Kittila_2007_03_07.JPG"
                 << "Harakka^https://commons.wikimedia.org/wiki/File:Pica_pica-_svraka_11.jpg"
                 << "Idännaakka^https://commons.wikimedia.org/wiki/File:Corvus_dauricus_map.jpg"
                 << "Korppi^https://commons.wikimedia.org/wiki/File:Corvus_corax_1_(Marek_Szczepanek).jpg"
                 << "Kottarainen^https://commons.wikimedia.org/wiki/File:British_Bird_(14943495853).jpg"
                 << "Varpunen^https://commons.wikimedia.org/wiki/File:Schweiz-zoo-gossau-2008-bild-b3.jpg"
                 << "Pikkuvarpunen^https://commons.wikimedia.org/wiki/File:Eurasian_tree_sparrows_sandbathing.jpg"
                 << "Punavarpunen^https://commons.wikimedia.org/wiki/File:Common_Rosefinch_male_DSC0032.jpg"
                 << "Nokkavarpunen^https://commons.wikimedia.org/wiki/File:Stenkn%C3%A4ck-1_-_Flickr_-_Ragnhild_%26_Neil_Crawford.jpg"
                 << "Lapinsirkku^https://commons.wikimedia.org/wiki/File:Lapland_Longspur_-_Calcarius_lapponicus_-_Sportittlingur_1.jpg"
                 << "Pulmunen^https://commons.wikimedia.org/wiki/File:Plectrophenax_nivalis_Oulu_20140406_02.JPG"
                 << "Pohjansirkku^https://commons.wikimedia.org/wiki/File:Rustic_bunting_(Emberiza_rustica)_(32317033461).jpg"
                 << "Kastanjasirkku^https://commons.wikimedia.org/wiki/File:Emberiza_rutila_Fauna_Japonica.jpg"
                 << "Kultasirkku^https://commons.wikimedia.org/wiki/File:Emberiza_aureola_male.jpg"
                 << "Joutsenhanhi^https://commons.wikimedia.org/wiki/File:Anser_cygnoides,_Mongolia_2.jpg"
                 << "Tiibetinhanhi^https://commons.wikimedia.org/wiki/File:Bar-headed_Geese_(Anser_indicus)_in_beautiful_formation_at_Bharatpur_I_IMG_5653.jpg"
                 << "Eskimohanhi^https://commons.wikimedia.org/wiki/File:Ross%27s_Goose_(8149369345).jpg"
                 << "Siperiantavi^https://commons.wikimedia.org/wiki/File:Baikal_Teal.jpg"
                 << "Valkoposkisorsa^https://commons.wikimedia.org/wiki/File:White-cheeked_pintall_(4797631059).jpg"
                 << "Flamingo^https://commons.wikimedia.org/wiki/File:AYVALIK_TUZLA_-_panoramio.jpg"
                 << "Chilenflamingo^https://commons.wikimedia.org/wiki/File:Phoenicopterus_chilensis,_Lago_Chungara,_Chile.jpg"
                 << "Pikkuflamingo^https://commons.wikimedia.org/wiki/File:Lesser_Flamingo_Phoeniconaias_minor_in_Tanzania_2097_Nevit.jpg"
                 << "Kiinankottarainen^https://commons.wikimedia.org/wiki/File:White-shouldered_Starling_-_Taiwan_LIN_5774_(22382964538).jpg"
                 << "Pihamaina^https://commons.wikimedia.org/wiki/File:(1)Mynah.jpg"
                 << "Pyrstötulkku^https://commons.wikimedia.org/wiki/File:Carpodacus_sibiricus_sanguinolentus_(female_eating).JPG"
                 << "Japaninnokkavarpunen^https://commons.wikimedia.org/wiki/File:Naturalis_Biodiversity_Center_-_RMNH.AVES.5162_1_-_Coccothraustes_personatus_subsp._-_Fringillidae_-_bird_skin_specimen.jpeg"
                 << "Niittysirkku^https://commons.wikimedia.org/wiki/File:Emberiza_cioides.jpg"
                 << "Kultatöyhtösirkku^https://commons.wikimedia.org/wiki/File:Yellow_throated_bunting,_male_-_Flickr_-_Lip_Kee.jpg"
                 << "Indigokardinaali^https://commons.wikimedia.org/wiki/File:Indigo_bunting_(41306112204).jpg";
}
