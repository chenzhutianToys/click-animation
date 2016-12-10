import NoBallDrop from './../NoBallDrop/NoBallDrop.vue';
//const ROOTPATH = "/~zchenbn/click-animation/";
const ROOTPATH = "/";
export default {
    ready() {
        d3.json(this.rawDataPath, (err, data) => {
            if (err) throw err;
            this.rawData = data;
            d3.json(this.rawStackDataPath, (err1, stackData) => {
                if (err1) throw err1;
                this.rawStackData = stackData;
                this.videoIds = this.$refs.clickAnimationComponent.setRawdata(data, stackData);
            });
        });
    },
    components: {
        NoBallDrop
    },
    rawData: null,
    rawStackData: null,
    data() {
        return {
            rawDataPath: ROOTPATH + "data/animation_All17.json_clean",
            rawStackDataPath: ROOTPATH + "data/animation_All17.json_clean_stack",
            vLinkIndex: "/",
            vLinkCongleiPath: "/conglei",
            vLinkNoForeshadow: "/no-foreshadow",

            videoIds: [],
            selectedVideo: null,

            zoomScaleMax: 8,
            zoomScaleList: [1, 2, 4, 8, 16],
            isAcceleration: true,
        }
    },
    methods: {
        getData() {
            if (this.rawData && this.rawStackData) {
                this.videoIds = this.$refs.clickAnimationComponent.setRawdata(this.rawData, this.rawStackData);
                if (this.selectedVideo) {
                    this.$refs.clickAnimationComponent.SelectVideo(this.selectedVideo);
                }
            }
        },
        SelectVideo() {
            this.$refs.clickAnimationComponent.SelectVideo(this.selectedVideo);
        },
        SelectSpeed() {
            this.$refs.clickAnimationComponent.SelectSpeed(this.zoomScaleMax);
        },

        ChangeAcceleration() {
            this.$refs.clickAnimationComponent.ChangeAcceleration(this.isAcceleration);
        },
        Pause() {
            this.$refs.clickAnimationComponent.Pause();
        },
        Resume() {
            this.$refs.clickAnimationComponent.Resume();
        }
    }
}