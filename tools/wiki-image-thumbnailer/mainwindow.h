/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 *
 */

#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>

struct image_metadata_s
{
    QString authorName = "";
    QString directImageUrl = "";
    QString wikimediaImageUrl = ""; // E.g. https://commons.wikimedia.org/wiki/File:Canadian-goose.jpg
    QString licenseDetails = "";
    QString speciesName = "";
};

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();

private slots:
    void on_pushButton_save_clicked();

    void on_pushButton_skip_clicked();

private:
    void save();

    void skip();

    void next_image();

    void fetch_wikimedia_resource(const QString speciesName, const QString url);

    void populate_images_list();

    void update_display_image();

    void update_gui_metadata_info();

    image_metadata_s get_image_metadata(const QString html);

    Ui::MainWindow *ui;

    image_metadata_s currentImageMetadata;

    QStringList images;
};

#endif
