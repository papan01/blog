import React from 'react';
import Layout from '../layout/index';
import PostCover from '../components/postCover';
import './about.scss';

const About = () => {
  return (
    <Layout>
      <article className="about">
        <section className="about-head">
          <PostCover imagePath="louis.png" wrapClass="user-avatar" />
          <p>
            大學念數學，碩士唸資工，自學程式，目前學習前端約半年，一直以來都想自己做個blog來記錄與分享自己的學習路程，
            而這個blog也成為我第一個獨立完成的網頁，想聯絡我最底下有我的聯絡方式。
          </p>
        </section>
      </article>
    </Layout>
  );
};

export default About;
