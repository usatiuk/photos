import "./Photo.scss";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IPhotoReqJSON } from "../../../src/entity/Photo";
import { LoadingStub } from "../LoadingStub";
import {
    fetchPhoto,
    getPhotoImgPath,
    getPhotoThumbPath,
} from "../redux/api/photos";
import { photoLoadStart } from "../redux/photos/actions";
import { IPhotoState } from "../redux/photos/reducer";
import { IAppState } from "../redux/reducers";
import { LargeSize, PreviewSize } from "./helper";

export interface IPhotoComponentProps {
    id: number;
    photo: IPhotoReqJSON | undefined;
    photoState: IPhotoState | undefined;

    fetchPhoto: (id: number) => void;
    close: () => void;
}

export const PhotoComponent: React.FunctionComponent<IPhotoComponentProps> = (
    props,
) => {
    const [smallPreviewFetching, setSmallPreviewFetching] =
        React.useState<boolean>(false);
    const [largePreviewFetching, setLargePreviewFetching] =
        React.useState<boolean>(false);
    const [originalFetching, setOriginalFetching] =
        React.useState<boolean>(false);

    const [smallPreview, setSmallPreview] = React.useState<string | null>(null);
    const [largePreview, setLargePreview] = React.useState<string | null>(null);
    const [original, setOriginal] = React.useState<string | null>(null);
    const imgRef = React.useRef<HTMLImageElement>(null);

    React.useEffect(() => {
        async function fetchSmall() {
            if (props.photo && !smallPreview && !smallPreviewFetching) {
                setSmallPreviewFetching(true);
                const smallPreviewFetch = await fetch(
                    getPhotoThumbPath(props.photo, PreviewSize),
                );
                setSmallPreview(
                    URL.createObjectURL(await smallPreviewFetch.blob()),
                );
                //console.log("got small");
            }
        }
        void fetchSmall();
    }, [smallPreview, smallPreviewFetching]);

    React.useEffect(() => {
        async function fetchLarge() {
            if (props.photo && !largePreview && !largePreviewFetching) {
                setLargePreviewFetching(true);
                const largePreviewFetch = await fetch(
                    getPhotoThumbPath(props.photo, LargeSize),
                );
                setLargePreview(
                    URL.createObjectURL(await largePreviewFetch.blob()),
                );
                //console.log("got large");
            }
        }
        void fetchLarge();
    }, [largePreview, largePreviewFetching]);

    React.useEffect(() => {
        async function fetchOriginal() {
            if (props.photo && !original && !originalFetching) {
                setOriginalFetching(true);
                const originalFetch = await fetch(getPhotoImgPath(props.photo));
                setOriginal(URL.createObjectURL(await originalFetch.blob()));
                //console.log("got original");
            }
        }
        void fetchOriginal();
    }, [original, originalFetching]);

    if (!props.photo && !props.photoState?.fetching) {
        props.fetchPhoto(props.id);
    }
    if (!props.photo) {
        return <LoadingStub spinner={false} />;
    }
    const fileExists = props.photo.uploaded;

    return (
        <>
            {fileExists ? (
                <div
                    id="photoView"
                    onClick={(e: React.MouseEvent) => {
                        if ((e.target as HTMLElement).tagName !== "IMG")
                            props.close();
                    }}
                >
                    <img
                        ref={imgRef}
                        id="photoImg"
                        src={
                            original ||
                            largePreview ||
                            smallPreview ||
                            getPhotoThumbPath(props.photo, PreviewSize)
                        }
                    />
                </div>
            ) : (
                <div>Photo not uploaded yet</div>
            )}
        </>
    );
};

function mapStateToProps(state: IAppState, props: IPhotoComponentProps) {
    const { id } = props;
    return {
        photo: state.photos?.photos?.find((p) => p.id === id),
        photoState: state.photos?.photoStates?.[id],
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return { fetchPhoto: (id: number) => dispatch(photoLoadStart(id)) };
}

// Because https://github.com/DefinitelyTyped/DefinitelyTyped/issues/16990
export const Photo = connect(
    mapStateToProps,
    mapDispatchToProps,
)(PhotoComponent) as any;
