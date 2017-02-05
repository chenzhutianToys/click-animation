import Vue from 'vue';
import VueRouter from 'vue-router';
//components here
import App from './components/App/App.vue';
import NoBallDrop from './components/NoBallDrop/NoBallDrop.vue';
import Conglei from './components/CongleiBaseline/CongleiBaseline.vue';
import NoForeshadow from './components/NoForeShadowBaseline/NoForeshadowBaseline.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    //root:"/~zchenbn/click-animation",
    root:"/click-animation",
    history: true,
    saveScrollPosition: true
});

router.map({
    '/': {
        component: NoBallDrop
    },
    '/conglei': {
        component: Conglei
    },
    '/no-foreshadow': {
        component: NoForeshadow
    }
});

router.start(App, '#app');
