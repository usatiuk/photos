import "./PhotoCard.scss";

import {
    Card,
    ContextMenuTarget,
    Menu,
    MenuItem,
    Spinner,
} from "@blueprintjs/core";
import * as React from "react";
import { IPhotoReqJSON } from "../../../src/entity/Photo";
import { getPhotoImgPath, getPhotoThumbPath } from "../redux/api/photos";
import { showDeletionToast } from "../AppToaster";
import { Dispatch } from "redux";
import { photoDeleteCancel, photoDeleteStart } from "../redux/photos/actions";
import { connect } from "react-redux";
import { LoadingStub } from "../LoadingStub";
import { RouteComponentProps, withRouter } from "react-router";
import { LargeSize, PreviewSize } from "./helper";

export interface IPhotoCardComponentProps extends RouteComponentProps {
    photo: IPhotoReqJSON;

    deletePhoto: (photo: IPhotoReqJSON) => void;
    cancelDelete: (photo: IPhotoReqJSON) => void;
    onClick: () => void;
}

export interface IPhotoCardComponentState {
    loaded: boolean;
}

const defaultPhotoCardState: IPhotoCardComponentState = {
    loaded: false,
};

@ContextMenuTarget
export class PhotoCardComponent extends React.PureComponent<
    IPhotoCardComponentProps,
    IPhotoCardComponentState
> {
    constructor(props: IPhotoCardComponentProps) {
        super(props);

        this.handleDelete = this.handleDelete.bind(this);
        this.setLoaded = this.setLoaded.bind(this);
        //this.handleEdit = this.handleEdit.bind(this);
        this.state = defaultPhotoCardState;
    }

    private setLoaded(loaded: boolean) {
        this.setState({ ...this.state, loaded });
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

        const preloadImage = (url: string) => {
            const img = new Image();
            img.src = url;
        };

        return (
            <Card
                className="photoCard"
                interactive={true}
                onClick={() => this.props.onClick()}
            >
                {fileExists ? (
                    <img
                        src={getPhotoThumbPath(this.props.photo, PreviewSize)}
                        className={this.state.loaded ? "loaded" : "notLoaded"}
                        onLoad={() => this.setLoaded(true)}
                        /*
                        onMouseEnter={() =>
                            preloadImage(
                                getPhotoThumbPath(this.props.photo, LargeSize),
                            )
                        }
                        */
                    ></img>
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

export const PhotoCard = withRouter(
    connect(null, mapDispatchToProps)(PhotoCardComponent),
);
