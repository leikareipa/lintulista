/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 *
 */

#include "image_display.h"
#include <QMouseEvent>
#include <QPainter>
#include <QDebug>

/// Temp hack. Keep track of the size of the display image after being scaled to fit
/// the widget.
static QSize RESIZED_IMAGE_SIZE;

ImageDisplay::ImageDisplay(QWidget *parent) : QWidget(parent)
{
    this->setMouseTracking(true);

    this->selectionFrame.setAttribute(Qt::WA_TransparentForMouseEvents );
    this->selectionFrame.setParent(this);
    this->selectionFrame.resize(100, 100);
    this->selectionFrame.setStyleSheet("background-color: transparent;"
                                       "border: 3px solid white;"
                                       "border-radius: 50%;");

    this->selectedFrame.setVisible(false); // Initially hidden; shown when the user clicks on the image to set the selection.
    this->selectedFrame.setAttribute(Qt::WA_TransparentForMouseEvents );
    this->selectedFrame.setParent(this);
    this->selectedFrame.setStyleSheet("background-color: transparent;"
                                      "border: 3px solid yellow;");

    return;
}

void ImageDisplay::display_image(const QImage &image)
{
    this->currentDisplayImage = image;

    this->update();

    return;
}

// Returns the sub-image of the current display image corresponding to the user's selection.
// If the user has made no selection, the entire image will be returned.
QImage ImageDisplay::get_selected_subregion()
{
    if (!this->selectedFrame.isVisible())
    {
        return this->currentDisplayImage;
    }

    const QImage &image = this->currentDisplayImage;

    const double sizeMultiplier = (RESIZED_IMAGE_SIZE.width() == this->width())? (image.width() / (double)this->width())
                                                                               : (image.height() / (double)this->height());

    const QPoint subPos = {int(this->selectedFrame.pos().x() * sizeMultiplier),
                           int(this->selectedFrame.pos().y() * sizeMultiplier)};

    const QSize subSize = {int(this->selectedFrame.width() * sizeMultiplier),
                           int(this->selectedFrame.height() * sizeMultiplier)};

    const int pixelStartIdx = (subPos.x() + subPos.y() * image.width()) * (image.depth() / 8);

    QImage subregion((image.bits() + pixelStartIdx), subSize.width(), subSize.height(), image.bytesPerLine(), image.format());

    return subregion;
}

void ImageDisplay::paintEvent(QPaintEvent *)
{
    QPainter painter(this);

    if (!this->currentDisplayImage.isNull())
    {
        const QImage resizedImage = this->currentDisplayImage.scaled(this->width(), this->height(), Qt::KeepAspectRatio, Qt::SmoothTransformation);
        RESIZED_IMAGE_SIZE = resizedImage.size();

        painter.drawImage(0, 0, resizedImage);
    }
    else
    {
        painter.fillRect(0, 0, this->width(), this->height(), QColor("green"));
    }

    return;
}

void ImageDisplay::mousePressEvent(QMouseEvent *)
{
    this->selectedFrame.setVisible(true);
    this->selectedFrame.move(this->selectionFrame.pos());
    this->selectedFrame.resize(this->selectionFrame.size());

    return;
}

void ImageDisplay::mouseMoveEvent(QMouseEvent *e)
{
    this->selectionFrame.move(e->pos());

    return;
}

void ImageDisplay::wheelEvent(QWheelEvent *e)
{
    this->selectionFrame.resize(this->selectionFrame.width() - (e->angleDelta().ry() / 10),
                                this->selectionFrame.height() - (e->angleDelta().ry() / 10));

    return;
}
