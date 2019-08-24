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
    this->images << "Amerikanmustalintu^https://commons.wikimedia.org/wiki/File:Black_Scoters,_Tiscornia_Park,_17_November_2012_(8198627638).jpg"
                 << "Pikkuliitäjä^https://commons.wikimedia.org/wiki/File:800,Manx_shearwater.jpg"
                 << "Myrskykeiju^https://commons.wikimedia.org/wiki/File:148_-_LEACH%27S_STORM-PETREL_(9-15-2918)_MAS_pelagic_trip,_out_of_bar_harbor,_me_-01_(44106789154).jpg"
                 << "Suula^https://commons.wikimedia.org/wiki/File:Northern-Gannet-2.jpg"
                 << "Keisarikotka^https://commons.wikimedia.org/wiki/File:Eastern_Imperial_Eagle.jpg"
                 << "Neitokurki^https://commons.wikimedia.org/wiki/File:Demoiselle_Crane_(Grus_virgo)_(8079417550).jpg"
                 << "Jänkäkurppa^https://commons.wikimedia.org/wiki/File:Lymnocryptes_minimus_(Marek_Szczepanek).jpg"
                 << "Hietatiira^https://commons.wikimedia.org/wiki/File:Gelochelidon_nilotica_vanrossemi.jpg"
                 << "Mustatiira^https://commons.wikimedia.org/wiki/File:%C4%8Cor%C3%ADk_%C4%8Dierny_(Chlidonias_niger)_a_(4644831482).jpg"
                 << "Ruusulokki^https://commons.wikimedia.org/wiki/File:Ross%27s_Gull_(Rhodostethia_rosea)_1_(cropped).jpg"
                 << "Kyläpöllönen^https://commons.wikimedia.org/wiki/File:Otus_scops_1_(Bohu%C5%A1_%C4%8C%C3%AD%C4%8Del).jpg"
                 << "Kehrääjä^https://commons.wikimedia.org/wiki/File:%D0%9E%D0%B1%D1%8B%D0%BA%D0%BD%D0%BE%D0%B2%D0%B5%D0%BD%D0%BD%D1%8B%D0%B9_%D0%BA%D0%BE%D0%B7%D0%BE%D0%B4%D0%BE%D0%B9.jpg"
                 << "Alppikiitäjä^https://commons.wikimedia.org/wiki/File:Alpine_swift_at_Koytendag,_SE_Turkmenistan_.jpg"
                 << "Ylänkökiuru^https://commons.wikimedia.org/wiki/File:Bimaculated_Lark_(Melanocorypha_bimaculata).jpg"
                 << "Valkosiipikiuru^https://commons.wikimedia.org/wiki/File:White-winged_Lark_-_Kazakistan_S4E0496_(16947462615).jpg"
                 << "Räystäspääsky^https://commons.wikimedia.org/wiki/File:Mehlschwalbe.jpg"
                 << "Koskikara^https://commons.wikimedia.org/wiki/File:01_vwam-10-12.jpg"
                 << "Kirjorastas^https://commons.wikimedia.org/wiki/File:White%27s_Thrush_-_Taiwan_S4E8185_(17027482527).jpg"
                 << "Viirusirkkalintu^https://commons.wikimedia.org/wiki/File:Locustella_lanceolata_photo.jpg"
                 << "Amurinuunilintu^https://commons.wikimedia.org/wiki/File:Eastern_crowned_warbler.jpg"
                 << "Mustaviklo^https://commons.wikimedia.org/wiki/File:14107739813_Jpg_(106032381).jpeg";
}
