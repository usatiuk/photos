import { Button } from "@blueprintjs/core";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { photosUploadStart } from "../redux/photos/actions";

export interface IUploadButtonComponentProps {
    startUpload: (files: FileList) => void;
}

export const UploadButtonComponent: React.FunctionComponent<IUploadButtonComponentProps> = (
    props,
) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            props.startUpload(e.target.files);
        }
    };

    return (
        <>
            <input
                accept="image/*"
                id="photosHiddenInput"
                hidden
                multiple
                type="file"
                ref={fileInputRef}
                onChange={onInputChange}
            />
            <Button
                icon="upload"
                text="Upload"
                outlined={true}
                onClick={() => {
                    fileInputRef.current?.click();
                }}
            />
        </>
    );
};

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        startUpload: (files: FileList) => dispatch(photosUploadStart(files)),
    };
}

export const UploadButton = connect(
    null,
    mapDispatchToProps,
)(UploadButtonComponent);
