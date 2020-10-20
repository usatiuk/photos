import { Button, Icon, Popover, Spinner } from "@blueprintjs/core";
import * as React from "react";
import { connect } from "react-redux";
import { IAppState } from "~redux/reducers";
import pluralize from "pluralize";

export interface IUploadStatusComponentProps {
    creatingNow: number;
    creatingQueue: number;

    uploadingNow: number;
    uploadingQueue: number;
}

export const UploadStatusComponent: React.FunctionComponent<IUploadStatusComponentProps> = (
    props,
) => {
    const { creatingNow, creatingQueue, uploadingNow, uploadingQueue } = props;
    const uploading =
        creatingNow > 0 ||
        creatingQueue > 0 ||
        uploadingNow > 0 ||
        uploadingQueue > 0;
    const uploadingCount =
        creatingNow + creatingQueue + uploadingNow + uploadingQueue;
    return uploading ? (
        <Button
            icon="cloud-upload"
            text={`Uploading ${uploadingCount} ${pluralize(
                "photo",
                uploadingCount,
            )}`}
        />
    ) : (
        <></>
    );
};

function mapStateToProps(state: IAppState) {
    return {
        creatingNow: state.photos.photosCreating,
        creatingQueue: state.photos.photoCreateQueue.length,
        uploadingNow: state.photos.photosUploading,
        uploadingQueue: Object.keys(state.photos.photoUploadQueue).length,
    };
}

export const UploadStatus = connect(mapStateToProps)(UploadStatusComponent);
