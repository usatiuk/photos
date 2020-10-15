import {
    Card,
    ContextMenuTarget,
    Menu,
    MenuItem,
    Spinner,
} from "@blueprintjs/core";
import * as React from "react";
import { IPhotoReqJSON } from "~../../src/entity/Photo";
import { getPhotoImgPath, getPhotoThumbPath } from "~redux/api/photos";
import { showDeletionToast } from "~AppToaster";
import { Dispatch } from "redux";
import { photoDeleteCancel, photoDeleteStart } from "~redux/photos/actions";
import { connect } from "react-redux";
import { LoadingStub } from "~LoadingStub";

export interface IPhotoCardComponentProps {
    photo: IPhotoReqJSON;

    deletePhoto: (photo: IPhotoReqJSON) => void;
    cancelDelete: (photo: IPhotoReqJSON) => void;
}

@ContextMenuTarget
export class PhotoCardComponent extends React.PureComponent<
    IPhotoCardComponentProps
> {
    constructor(props: IPhotoCardComponentProps) {
        super(props);

        this.handleDelete = this.handleDelete.bind(this);
        //this.handleEdit = this.handleEdit.bind(this);
    }

    public handleDelete(): void {
        showDeletionToast(() => this.props.cancelDelete(this.props.photo));
        this.props.deletePhoto(this.props.photo);
    }
    /*
    public handleEdit() {
        this.props.history.push(`/docs/${this.props.doc.id}/edit`);
    }
    */
    public render(): JSX.Element {
        const fileExists = this.props.photo.uploaded;
        return (
            <Card
                className="photoCard"
                interactive={true}
                /*
                onClick={() =>
                    this.props.history.push(`/docs/${this.props.doc.id}`)
                }
            */
            >
                {fileExists ? (
                    <img src={getPhotoThumbPath(this.props.photo, 512)}></img>
                ) : (
                    <Spinner />
                )}
            </Card>
        );
    }

    public renderContextMenu(): JSX.Element {
        return (
            <Menu>
                {/*
                <MenuItem onClick={this.handleEdit} icon="edit" text="Edit" />
                */}
                <MenuItem
                    onClick={this.handleDelete}
                    intent="danger"
                    icon="trash"
                    text="Delete"
                />
            </Menu>
        );
    }
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        deletePhoto: (photo: IPhotoReqJSON) =>
            dispatch(photoDeleteStart(photo)),
        cancelDelete: (photo: IPhotoReqJSON) =>
            dispatch(photoDeleteCancel(photo)),
    };
}

export const PhotoCard = connect(null, mapDispatchToProps)(PhotoCardComponent);
