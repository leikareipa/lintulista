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
    this->images << "Tukkakoskelo^https://commons.wikimedia.org/wiki/File:Red-breasted_merganser_(Adult_male_in_breeding_plumage)_(6796583115).jpg";
}
