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
      << this->currentImageMetadata.licenseDetails.toStdString() << "\n"
      << this->currentImageMetadata.wikimediaImageUrl.toStdString();
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
    this->images << "Lyhytnokkahanhi^https://commons.wikimedia.org/wiki/File:2015-03-10_Anser_brachyrhynchus,_Gosforth_Park_2.jpg"
                 << "Amerikanmustalintu^https://commons.wikimedia.org/wiki/File:Melanitta_americana_(16540964800).jpg"
                 << "Pilkkaniska^https://commons.wikimedia.org/wiki/File:Surf_Scoters_(6848772474).jpg"
                 << "Pikkuliitäjä^https://commons.wikimedia.org/wiki/File:Puffinus_puffinus_distribution.jpg"
                 << "Merikeiju^https://commons.wikimedia.org/wiki/File:Hydrobatesmap2.png"
                 << "Myrskykeiju^https://commons.wikimedia.org/wiki/File:Leach%27s_Storm_Petrel_escapes_Merlin_4.jpg"
                 << "Madeirankeiju^https://commons.wikimedia.org/wiki/File:Oceanodroma_cryptoleucura_AvesHawaiienses00Wils_0376.jpg"
                 << "Suula^https://commons.wikimedia.org/wiki/File:Helgoland_-_Basst%C3%B6lpel.jpg"
                 << "Keisarikotka^https://commons.wikimedia.org/wiki/File:%D7%A2%D7%99%D7%98_%D7%A9%D7%9E%D7%A9_2.jpg"
                 << "Neitokurki^https://commons.wikimedia.org/wiki/File:Demoiselle_Cranes_at_Khichan_(5).jpg"
                 << "Kuovi^https://commons.wikimedia.org/wiki/File:Eurasian_Curlew_Numenius_arquata_by_Dr._Raju_Kasambe_DSCN9498_(16).jpg"
                 << "Jänkäkurppa^https://commons.wikimedia.org/wiki/File:Jack_Snipe_(13828491443).jpg"
                 << "Hietatiira^https://commons.wikimedia.org/wiki/File:Gelochelidon_nilotica_1.jpg"
                 << "Mustatiira^https://commons.wikimedia.org/wiki/File:Black_Terns_off_Cora_Island_Beach_(47839800372).jpg"
                 << "Ruusulokki^https://commons.wikimedia.org/wiki/File:Ross%27s_Gull_(adult),_Red_Rock_Reservoir,_Iowa,_3_December_2013_(11206009806).jpg"
                 << "Kalliokyyhky^https://commons.wikimedia.org/wiki/File:%D7%A1%D7%9C%D7%A2_%D7%91%D7%91%D7%99%D7%AA_%D7%92%D7%95%D7%91%D7%A8%D7%99%D7%9F.jpg"
                 << "Kyläpöllönen^https://commons.wikimedia.org/wiki/File:Eurasian_Scops_Owl_(Otus_scops)_(8079442507).jpg"
                 << "Kehrääjä^https://commons.wikimedia.org/wiki/File:Caprimulgus_europaeus_L.jpg"
                 << "Alppikiitäjä^https://commons.wikimedia.org/wiki/File:Alpengierzwaluw-1_(28686842856).jpg"
                 << "Ylänkökiuru^https://commons.wikimedia.org/wiki/File:Bimaculated_Lark_(Melanocorypha_bimaculata)_(8079431487).jpg"
                 << "Valkosiipikiuru^https://commons.wikimedia.org/wiki/File:Mus%C3%A9e_ornithologique_illustr%C3%A9_(26283279356).jpg"
                 << "Räystäspääsky^https://commons.wikimedia.org/wiki/File:Delichon_urbicum_05.jpg"
                 << "Tundrakirvinen^https://commons.wikimedia.org/wiki/File:Anthus_gustavi_171.jpg"
                 << "Koskikara^https://commons.wikimedia.org/wiki/File:Dipper_on_a_fllen_tree,_Watersmeet_-_panoramio.jpg"
                 << "Kirjorastas^https://commons.wikimedia.org/wiki/File:Little_Tiger_(14181538074).jpg"
                 << "Viirusirkkalintu^https://commons.wikimedia.org/wiki/File:Naturalis_Biodiversity_Center_-_RMNH.AVES.92958_2_-_Locustella_lanceolata_(Temminck,_1840)_-_Sylviidae_-_bird_skin_specimen.jpeg"
                 << "Amurinuunilintu^https://commons.wikimedia.org/wiki/File:Phylloscopus_coronatus_Shaanxi_1.jpg"
                 << "Idännaakka^https://commons.wikimedia.org/wiki/File:Western_Jackdaw_and_Daurian_Jackdaw.jpg";
}
