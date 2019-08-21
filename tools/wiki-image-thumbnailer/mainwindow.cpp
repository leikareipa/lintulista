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

        /// Temp hack.
        metadata.authorName.remove("</a>");
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
    this->images << "Chilenflamingo^https://commons.wikimedia.org/wiki/File:Laguna_de_Rocha_with_birds.jpg"
                 << "Pikkuflamingo^https://commons.wikimedia.org/wiki/File:Lesser_Flamingo_Phoeniconaias_minor_in_Tanzania_2057_Nevit.jpg"
                 << "Kuningasmerikotka^https://commons.wikimedia.org/wiki/File:Haliaeetus_pelagicus_(Rausu,_Japan).jpg"
                 << "Palmukyyhky^https://commons.wikimedia.org/wiki/File:Laughing_Dove_Spilopelia_senegalensis_IMG_0490_(2)._Akola,_Maharashtra,_India..JPG"
                 << "Jakobiinikäki^https://commons.wikimedia.org/wiki/File:Jacobin_Cuckoo_(Clamator_jacobinus)_(33204180932).jpg"
                 << "Vuorileppälintu^https://commons.wikimedia.org/wiki/File:White-winged_Redstart_(Phoenicurus_erythrogastrus)_(45902196614).jpg"
                 << "Kalliokiipijä^https://commons.wikimedia.org/wiki/File:Wallcreeper_(Tichodroma_muraria)_3.jpg"
                 << "Kiinankottarainen^https://commons.wikimedia.org/wiki/File:Temenuchus_sinensis_-_1700-1880_-_Print_-_Iconographia_Zoologica_-_Special_Collections_University_of_Amsterdam_-_UBA01_IZ15800059.tif"
                 << "Viirupääkottarainen^https://commons.wikimedia.org/wiki/File:Sturnus_cineraceus_(6877775226).jpg"
                 << "Pihamaina^https://commons.wikimedia.org/wiki/File:Common_myna_(Juvenile)_spotted_at_Madhurawada_05.jpg"
                 << "Sitruunahemppo^https://commons.wikimedia.org/wiki/File:Citril_Finch_-_Aosta_Valley_-_Italy_H8O8036_(23051182591).jpg"
                 << "Pyrstötulkku^https://commons.wikimedia.org/wiki/File:Carpodacus_sibiricus_MHNT_228.jpg"
                 << "Japaninnokkavarpunen^https://commons.wikimedia.org/wiki/File:Naturalis_Biodiversity_Center_-_RMNH.AVES.5162_1_-_Coccothraustes_personatus_subsp._-_Fringillidae_-_bird_skin_specimen.jpeg"
                 << "Niittysirkku^https://commons.wikimedia.org/wiki/File:Mountain_Bunting_%E3%83%9B%E3%82%AA%E3%82%B8%E3%83%AD_(215389963).jpeg"
                 << "Kultatöyhtösirkku^https://commons.wikimedia.org/wiki/File:Yellow_throated_bunting,_male_-_Flickr_-_Lip_Kee_(1).jpg"
                 << "Ruskopääsirkku^https://commons.wikimedia.org/wiki/File:Red-headed_Bunting_Male_Best_DSCN9056_(5).jpg"
                 << "Indigokardinaali^https://commons.wikimedia.org/wiki/File:Indigo_Bunting_(female)_Battleground_SHP_Sabine_Pass_TX_2018-03-31_07-12-00_(40570367794).jpg"
                 << "Turkoosikardinaali^https://commons.wikimedia.org/wiki/File:Lazuli_Bunting_(42908144351).jpg"
                 << "Sateenkaarikardinaali^https://commons.wikimedia.org/wiki/File:Painted_Bunting_(male)_Smith_Oaks_High_Island_TX_2018-04-18_16-54-30_(28077075648).jpg";
}
